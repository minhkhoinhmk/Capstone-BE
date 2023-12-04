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

    if (request.startedDate >= request.expiredDate) {
      throw new InternalServerErrorException(
        'Ngày bắt đầu phải bé hơn ngày hết hạn',
      );
    }

    let contest = await this.contestRepository.createContest(request);
    contest.user = staff;

    const createdContest = await this.contestRepository.save(contest);

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
    pageOption: PageOptionsDto,
  ): Promise<PageDto<ViewContestResponse>> {
    let contests: Contest[] = [];
    const responses: ViewContestResponse[] = [];

    const { count, entites } = await this.contestRepository.getContests(
      pageOption,
    );

    contests = entites;

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
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

    return new PageDto(responses, pageMetaDto);
  }

  async getContestByStaffId(staffId: string): Promise<ViewContestResponse[]> {
    let contests = await this.contestRepository.getContestByStaffId(staffId);
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

    return responses;
  }
}
