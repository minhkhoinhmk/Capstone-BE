import {
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

  async getContestByStaffId(
    staffId: string,
    status: string,
  ): Promise<ViewContestResponse[]> {
    const contests = await this.contestRepository.getContestByStaffId(
      staffId,
      status,
    );
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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async setStatusContest() {
    const contests = await this.contestRepository.getContestsNotPagination();
    contests.forEach(async (contest) => {
      if (
        contest.status === ContestStatus.PENDING &&
        contest.startedDate.getTime() === new Date().getTime()
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

    if (
      contest.status === ContestStatus.ACTIVE &&
      contest.customerDrawings.length > 0
    ) {
      if (
        new Date(request.startedDate).getTime() !==
        contest.startedDate.getTime()
      ) {
        throw new InternalServerErrorException(
          'Cuộc thi đã có người tham gia, không thể thay đổi ngày bắt đầu',
        );
      } else {
        contest.title = request.title;
        contest.description = request.description;
        contest.prize = request.prize;
        contest.expiredDate = request.expiredDate;
        contest.isVisible = request.isVisible;

        await this.contestRepository.save(contest);
      }
    } else {
      contest.title = request.title;
      contest.description = request.description;
      contest.prize = request.prize;
      contest.startedDate = request.startedDate;
      contest.expiredDate = request.expiredDate;
      contest.isVisible = request.isVisible;

      await this.contestRepository.save(contest);
    }

    this.logger.log(
      `method=updateContest, contestId=${contest.id} updated successfully`,
    );
  }

  async deleteContest(contestId: string): Promise<void> {
    const contest = await this.contestRepository.getContestById(contestId);

    const options = {
      Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
      Key: contest.thumbnailUrl,
    };

    if (
      contest.status === ContestStatus.ACTIVE &&
      contest.customerDrawings.length > 0
    ) {
      throw new InternalServerErrorException(
        'Cuộc thi đã có người tham gia, không thể xóa',
      );
    } else {
      try {
        (await this.s3Service.deleteObject(options)).promise();

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
}
