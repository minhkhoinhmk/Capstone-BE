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
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ViewContestResponse } from './dto/response/view-contest-reponse.dto';
import { Contest } from './entity/contest.entity';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { ContestMapper } from './mapper/contest.mapper';
import ContestStatus from './enum/contest-status.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilterContestRequest } from './dto/request/filter-contest-request.dto';

@Injectable()
export class ContestService {
  private logger = new Logger('ContestService', { timestamp: true });

  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
    private readonly mapper: ContestMapper,
  ) {}

  async createContest(
    request: CreateContestRequest,
    staffId: string,
  ): Promise<Contest> {
    const staff = await this.userRepository.getUserById(staffId);

    if (
      new Date(request.startedDate).getDate() >=
      new Date(request.expiredDate).getDate()
    ) {
      throw new InternalServerErrorException(
        'Ngày bắt đầu phải bé hơn ngày hết hạn',
      );
    }

    let contest: Contest;

    if (new Date(request.startedDate).getDate() > new Date().getDate()) {
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
      let contest = await this.contestRepository.getContestById(contestId);
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
      let staffName = `${contest.user.lastName} ${contest.user.middleName} ${contest.user.firstName}`;
      let total = contest.customerDrawings.length;

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
    let contests = await this.contestRepository.getContestByStaffId(
      staffId,
      status,
    );
    const responses: ViewContestResponse[] = [];

    for (const contest of contests) {
      let staffName = `${contest.user.lastName} ${contest.user.middleName} ${contest.user.firstName}`;
      let total = contest.customerDrawings.length;

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
    let staffName = `${contest.user.lastName} ${contest.user.middleName} ${contest.user.firstName}`;
    let total = contest.customerDrawings.length;

    this.logger.log(`method=getContestById, id = ${contest.id}`);

    return this.mapper.filterViewContestResponseFromContest(
      contest,
      staffName,
      total,
    );
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async setStatusContest() {
    const contests = await this.contestRepository.getContestsNotPagination();
    contests.forEach(async (contest) => {
      if (
        contest.status === ContestStatus.PENDING &&
        contest.startedDate.getDate() === new Date().getDate()
      ) {
        contest.status = ContestStatus.ACTIVE;
        await this.contestRepository.save(contest);

        this.logger.log(
          `method=setStatusContest, contestId=${contest.id} move to active`,
        );
      } else if (
        contest.status === ContestStatus.ACTIVE &&
        contest.expiredDate.getDate() <= new Date().getDate()
      ) {
        contest.status = ContestStatus.EXPIRED;
        await this.contestRepository.save(contest);

        this.logger.log(
          `method=setStatusContest, contestId=${contest.id} move to expired`,
        );
      }
    });
  }
}
