import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ContestRepository } from './contest.repository';
import { UserRepository } from 'src/user/user.repository';
import { CreateContestRequest } from './dto/request/create-contest-request.dto';
import { CONTEST_THUMBNAIL_PATH } from 'src/common/s3/s3.constants';
import { S3Service } from 'src/s3/s3.service';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ViewContestResponse } from './dto/response/view-contest-reponse.dto';
import { Contest } from './entity/contest.entity';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { ContestMapper } from './mapper/contest.mapper';
import ContestStatus from './enum/contest-status.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilterContestRequest } from './dto/request/filter-contest-request.dto';
import { UpdateContestRequest } from './dto/request/update-contest-request.dto';
import { ConfigService } from '@nestjs/config';
import { PromotionRepository } from 'src/promotion/promotion.repository';
import { WinnerRepository } from 'src/winner/winner.repository';
import { getDateWithPlus1Year } from 'src/utils/date-vietnam.util';

@Injectable()
export class ContestService {
  private logger = new Logger('ContestService', { timestamp: true });

  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly promotionReposiotory: PromotionRepository,
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
    private readonly mapper: ContestMapper,
    private readonly configService: ConfigService,
    private readonly winnerRepository: WinnerRepository,
  ) {}

  async createContest(
    request: CreateContestRequest,
    staffId: string,
  ): Promise<Contest> {
    const staff = await this.userRepository.getUserById(staffId);

    if (
      new Date(request.startedDate).getTime() >=
      new Date(request.expiredDate).getTime()
    ) {
      throw new InternalServerErrorException(
        'Ngày bắt đầu phải bé hơn ngày hết hạn',
      );
    }

    let contest: Contest;

    if (new Date(request.startedDate).getTime() > new Date().getTime()) {
      contest = await this.contestRepository.createContest(
        request,
        ContestStatus.PENDING,
      );
    } else {
      contest = await this.contestRepository.createContest(
        request,
        ContestStatus.ACTIVE,
      );
    }

    contest.user = staff;

    const createdContest = await this.contestRepository.save(contest);

    this.logger.log(`method=createContest, created contest successfully`);

    return await this.contestRepository.getContestById(createdContest.id);
  }

  async uploadThumbnail(
    buffer: Buffer,
    type: string,
    substringAfterDot: string,
    contestId: string,
  ): Promise<void> {
    try {
      const contest = await this.contestRepository.getContestById(contestId);
      const key = `${CONTEST_THUMBNAIL_PATH}${contest.id}${substringAfterDot}`;

      contest.thumbnailUrl = key;

      await this.contestRepository.save(contest);

      await this.s3Service.putObject(buffer, key, type);

      this.logger.log(
        `method=uploadThumbnail, uploaded thumbnail successfully`,
      );
    } catch (error) {
      this.logger.error(`method=uploadThumbnail, error:${error.message}`);
    }
  }

  async getContests(
    request: FilterContestRequest,
  ): Promise<PageDto<ViewContestResponse>> {
    let contests: Contest[] = [];
    const responses: ViewContestResponse[] = [];

    const { count, entites } = await this.contestRepository.getContests(
      request,
    );

    contests = entites;

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: request.pageOptions,
    });

    for (const contest of contests) {
      const staffName = `${contest.user.lastName} ${contest.user.middleName} ${contest.user.firstName}`;
      const total = contest.customerDrawings.length;

      responses.push(
        this.mapper.filterViewContestResponseFromContest(
          contest,
          staffName,
          total,
        ),
      );
    }

    this.logger.log(`method=getContests, total = ${itemCount}`);

    return new PageDto(responses, pageMetaDto);
  }

  async getContestByStaff(
    staffId: string,
    status: string,
  ): Promise<ViewContestResponse[]> {
    const contests = await this.contestRepository.getContestByStaff(status);
    const responses: ViewContestResponse[] = [];

    for (const contest of contests) {
      const staffName = `${contest.user.lastName} ${contest.user.middleName} ${contest.user.firstName}`;
      const total = contest.customerDrawings.length;

      responses.push(
        this.mapper.filterViewContestResponseFromContest(
          contest,
          staffName,
          total,
        ),
      );
    }

    this.logger.log(`method=getContestByStaffId, total = ${responses.length}`);

    return responses;
  }

  async getContestById(contestId: string): Promise<ViewContestResponse> {
    const contest = await this.contestRepository.getContestById(contestId);
    const staffName = `${contest.user.lastName} ${contest.user.middleName} ${contest.user.firstName}`;
    const total = contest.customerDrawings.length;

    this.logger.log(`method=getContestById, id = ${contest.id}`);

    return this.mapper.filterViewContestResponseFromContest(
      contest,
      staffName,
      total,
    );
  }

  async getContestStatusActive(): Promise<Contest[]> {
    const contests = await this.contestRepository.getContestStatusActive();

    return contests;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async setStatusContest() {
    const contests = await this.contestRepository.getContestsNotPagination();
    contests.forEach(async (contest) => {
      if (
        contest.status === ContestStatus.PENDING &&
        contest.startedDate.getTime() <= new Date().getTime()
      ) {
        contest.status = ContestStatus.ACTIVE;
        await this.contestRepository.save(contest);

        this.logger.log(
          `method=setStatusContest, contestId=${contest.id} move to active`,
        );
      } else if (
        contest.status === ContestStatus.ACTIVE &&
        contest.expiredDate.getTime() < new Date().getTime()
      ) {
        contest.status = ContestStatus.EXPIRED;
        await this.contestRepository.save(contest);

        this.logger.log(
          `method=setStatusContest, contestId=${contest.id} move to expired`,
        );
      }
    });
  }

  async updateContest(
    request: UpdateContestRequest,
    contestId: string,
  ): Promise<void> {
    const contest = await this.contestRepository.getContestById(contestId);
    console.log(contest);

    if (contest.status === ContestStatus.EXPIRED) {
      contest.isVisible = request.isVisible;
      await this.contestRepository.save(contest);
      return;
    }

    if (contest.status === ContestStatus.ACTIVE) {
      if (
        new Date(request.expiredDate).getTime() !==
          contest.expiredDate.getTime() &&
        new Date(request.expiredDate).getTime() <= new Date().getTime()
      ) {
        throw new BadRequestException(
          `Thời gian kết thúc cuộc thi không được phép nhỏ hơn hoặc bằng giờ hiện tại`,
        );
      }

      contest.title = request.title;
      contest.description = request.description;
      contest.prize = request.prize;
      contest.expiredDate = new Date(request.expiredDate);
      contest.isVisible = request.isVisible;
      await this.contestRepository.save(contest);
      for (const winner of contest.winners) {
        if (winner.position === 1) {
          winner.promotion.discountPercent = request.discountPercentFirst;
          winner.promotion.effectiveDate = new Date(request.expiredDate);
          winner.promotion.expiredDate = getDateWithPlus1Year(
            new Date(request.expiredDate),
          );
          await this.promotionReposiotory.savePromotion(winner.promotion);
        }
        if (winner.position === 2) {
          winner.promotion.discountPercent = request.discountPercentSecond;
          winner.promotion.effectiveDate = new Date(request.expiredDate);
          winner.promotion.expiredDate = getDateWithPlus1Year(
            new Date(request.expiredDate),
          );
          await this.promotionReposiotory.savePromotion(winner.promotion);
        }
        if (winner.position === 3) {
          winner.promotion.discountPercent = request.discountPercentThird;
          winner.promotion.effectiveDate = new Date(request.expiredDate);
          winner.promotion.expiredDate = getDateWithPlus1Year(
            new Date(request.expiredDate),
          );
          await this.promotionReposiotory.savePromotion(winner.promotion);
        }
      }
      this.logger.log(
        `method=updateContest, contestId=${contest.id} updated successfully`,
      );
    }

    if (contest.status === ContestStatus.PENDING) {
      if (
        new Date(request.startedDate).getTime() !==
          contest.startedDate.getTime() &&
        new Date(request.startedDate).getTime() < new Date().getTime()
      ) {
        throw new BadRequestException(
          `Thời gian bắt đầu cuộc thi không được phép nhỏ hơn giờ hiện tại`,
        );
      }

      if (
        new Date(request.expiredDate).getTime() !==
          contest.expiredDate.getTime() &&
        new Date(request.expiredDate).getTime() < new Date().getTime()
      ) {
        throw new BadRequestException(
          `Thời gian kết thúc cuộc thi không được phép nhỏ hơn giờ hiện tại`,
        );
      }

      if (
        new Date(request.startedDate).getTime() >
        new Date(request.expiredDate).getTime()
      ) {
        throw new BadRequestException(
          `Thời gian bắt đầu cuộc thi không được phép lớn hơn thời gian kết thúc cuộc thi`,
        );
      }

      contest.title = request.title;
      contest.description = request.description;
      contest.prize = request.prize;
      contest.startedDate = new Date(request.startedDate);
      contest.expiredDate = new Date(request.expiredDate);
      contest.isVisible = request.isVisible;
      await this.contestRepository.save(contest);
      for (const winner of contest.winners) {
        if (winner.position === 1) {
          winner.promotion.discountPercent = request.discountPercentFirst;
          winner.promotion.effectiveDate = new Date(request.expiredDate);
          winner.promotion.expiredDate = getDateWithPlus1Year(
            new Date(request.expiredDate),
          );
          await this.promotionReposiotory.savePromotion(winner.promotion);
        }
        if (winner.position === 2) {
          winner.promotion.discountPercent = request.discountPercentSecond;
          winner.promotion.effectiveDate = new Date(request.expiredDate);
          winner.promotion.expiredDate = getDateWithPlus1Year(
            new Date(request.expiredDate),
          );
          await this.promotionReposiotory.savePromotion(winner.promotion);
        }
        if (winner.position === 3) {
          winner.promotion.discountPercent = request.discountPercentThird;
          winner.promotion.effectiveDate = new Date(request.expiredDate);
          winner.promotion.expiredDate = getDateWithPlus1Year(
            new Date(request.expiredDate),
          );
          await this.promotionReposiotory.savePromotion(winner.promotion);
        }
      }
      this.logger.log(
        `method=updateContest, contestId=${contest.id} updated successfully`,
      );
    }
  }

  async deleteContest(contestId: string): Promise<void> {
    const contest = await this.contestRepository.getContestById(contestId);

    if (contest.customerDrawings.length > 0) {
      throw new BadRequestException(
        'Cuộc thi đã có người tham gia, không thể xóa',
      );
    } else if (contest.isVisible) {
      throw new BadRequestException(
        'Cuộc thi vẫn hiện trên giao diện trang chủ, nên không thể xóa',
      );
    }

    try {
      if (contest.thumbnailUrl) {
        const options = {
          Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
          Key: contest.thumbnailUrl,
        };

        (await this.s3Service.deleteObject(options)).promise();
      }

      if (contest.winners.length > 0) {
        for (const winner of contest.winners) {
          await this.winnerRepository.removeWinner(winner);
        }
      }

      await this.contestRepository.removeContest(contest);

      this.logger.log(
        `method=deleteContest, contestId=${contestId} removed successfully`,
      );
    } catch (error) {
      this.logger.log(`method=deleteContest, error=${error.message}`);
    }
  }
}
