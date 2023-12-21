import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContestRepository } from 'src/contest/contest.repository';
import { CustomerDrawingRepository } from 'src/customer-drawing/customer-drawing.repository';
import { WinnerRepository } from './winner.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ViewWinnerReponse } from './dto/response/view-winner-reponse.entity';
import { WinnerMapper } from './mapper/winner.mapper';
import { DefinePromotionForWinnerRequest } from './dto/request/define-promotion-for-winner.request.dto';
import { PromotionService } from 'src/promotion/promotion.service';
import { User } from 'src/user/entity/user.entity';
import { VoteService } from 'src/vote/vote.service';
import { UserRepository } from 'src/user/user.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { DeviceRepository } from 'src/device/device.repository';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
import { NotificationService } from 'src/notification/notification.service';
import { getDateWithPlus1Year } from 'src/utils/date-vietnam.util';
import { PromotionRepository } from 'src/promotion/promotion.repository';

@Injectable()
export class WinnerService {
  private logger = new Logger('WinnerService', { timestamp: true });

  constructor(
    private readonly customerDrawingRepository: CustomerDrawingRepository,
    private readonly contestRepository: ContestRepository,
    private readonly winnerRepository: WinnerRepository,
    private readonly promotionService: PromotionService,
    private readonly mapper: WinnerMapper,
    private readonly voteService: VoteService,
    private readonly userRepository: UserRepository,
    private mailsService: MailerService,
    private readonly deviceRepository: DeviceRepository,
    private readonly dynamodbService: DynamodbService,
    private readonly notificationService: NotificationService,
    private readonly promotionRepository: PromotionRepository,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async defineWinner(): Promise<void> {
    const contests = await this.contestRepository.getContestsToDefineWinner(
      new Date(),
    );

    for (const contest of contests) {
      const customerDrawings =
        await this.customerDrawingRepository.defineWinner(contest.id);

      let position = 1;

      for (const [index, customerDrawing] of customerDrawings.entries()) {
        const numsVoteOfCurrentCustomer =
          await this.voteService.getNumsVoteOfUserInContest(
            await this.userRepository.getUserById(customerDrawing.user.id),
            contest,
          );

        if (numsVoteOfCurrentCustomer !== 0 && position <= 3) {
          const winner =
            await this.winnerRepository.getWinnerByPostionAndContest(
              customerDrawing.contest.id,
              position,
            );
          position++;

          winner.customerDrawing = customerDrawing;
          winner.active = true;
          winner.promotion.effectiveDate = new Date(contest.expiredDate);
          winner.promotion.expiredDate = getDateWithPlus1Year(
            new Date(contest.expiredDate),
          );

          await this.promotionRepository.savePromotion(winner.promotion);
          await this.winnerRepository.saveWinner(winner);

          await this.mailsService.sendMail({
            to: customerDrawing.user.email,
            subject: 'Kết quả cuộc thi',
            template: './winner',
            context: {
              CONTEST: customerDrawing.contest.title,
              POSITION: winner.position,
              PERCENT: winner.promotion.discountPercent,
              PROMOTION: winner.promotion.code,
            },
          });

          const tokens = await this.deviceRepository.getDeviceByUserId(
            customerDrawing.user.id,
          );

          const createNotificationDto = {
            title: `Cuộc thi ${customerDrawing.contest.title}`,
            body: `Xin chúc mừng, bạn đã giành vị trí thứ ${winner.position} tại cuộc thi ${customerDrawing.contest.title}`,
            data: {
              type: 'WINNER-PRIZE',
              contestId: customerDrawing.contest.id,
            },
            userId: customerDrawing.user.id,
          };

          await this.dynamodbService.saveNotification(createNotificationDto);

          tokens.forEach((token) => {
            const payload = {
              token: token.deviceTokenId,
              title: createNotificationDto.title,
              body: createNotificationDto.body,
              data: createNotificationDto.data,
              userId: token.user.id,
            };

            this.notificationService.sendingNotification(payload);
          });
        }
      }

      contest.isPrized = true;
      await this.contestRepository.save(contest);

      this.logger.log(`Contest with ${contest.id} had been prized`);
    }
  }

  async getWinnerByContestId(contestId: string): Promise<ViewWinnerReponse[]> {
    const winners = await this.winnerRepository.getWinnerByContestId(contestId);
    const response: ViewWinnerReponse[] = [];

    for (const winner of winners) {
      const totalVotes = winner.customerDrawing.votes.length;
      const fullName = `${winner.customerDrawing.user.firstName} ${winner.customerDrawing.user.middleName} ${winner.customerDrawing.user.lastName}`;
      response.push(
        this.mapper.filterViewWinnerResponseFromWinner(
          winner,
          fullName,
          totalVotes,
        ),
      );
    }

    return response;
  }

  async definePromotionForWinner(
    body: DefinePromotionForWinnerRequest,
    contestId: string,
    user: User,
  ) {
    const contest = await this.contestRepository.getContestById(contestId);

    if (!contest) {
      this.logger.error(
        `method=definePromotionForWinner, contest ${contestId} not found`,
      );
      throw new NotFoundException(`contest ${contestId} not found`);
    }

    const promotionFirst = await this.promotionService.createPromotionByStaff(
      user,
      `Prize for contest ${contest.title} of first position`,
      body.discountPercentFirst,
      body.effectiveDateFirst,
      body.expiredDateFirst,
      this.generateRandomString(),
    );

    const promotionSecond = await this.promotionService.createPromotionByStaff(
      user,
      `Prize for contest ${contest.title} of second position`,
      body.discountPercentSecond,
      body.effectiveDateSecond,
      body.expiredDateSecond,
      this.generateRandomString(),
    );

    const promotionThird = await this.promotionService.createPromotionByStaff(
      user,
      `Prize for contest ${contest.title} of third position`,
      body.discountPercentThird,
      body.effectiveDateThird,
      body.expiredDateThird,
      this.generateRandomString(),
    );

    await this.winnerRepository.saveWinner(
      this.winnerRepository.createWinner(1, null, promotionFirst, contest),
    );
    await this.winnerRepository.saveWinner(
      this.winnerRepository.createWinner(2, null, promotionSecond, contest),
    );
    await this.winnerRepository.saveWinner(
      this.winnerRepository.createWinner(3, null, promotionThird, contest),
    );
  }

  generateRandomString() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }
}
