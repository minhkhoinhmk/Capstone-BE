import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CustomerDrawingRepository } from './customer-drawing.repository';
import { UserRepository } from 'src/user/user.repository';
import { S3Service } from 'src/s3/s3.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateCustomerDrawingRequest } from './dto/request/create-customer-drawing-request.dto';
import { ContestRepository } from 'src/contest/contest.repository';
import { CustomerDrawing } from './entity/customer-drawing.entity';
import { CUSTOMER_DRAWING_PATH } from 'src/common/s3/s3.constants';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ViewCustomerDrawingResponse } from './dto/response/view-customer-drawing-response.dto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { CustomerDrawingMapper } from './mapper/customer-drawing.mapper';
import { FilterCustomerDrawingRequest } from './dto/request/filter-customer-drawing-request.dto';
import CustomerDrawingStatus from './enum/customer-drawing-status.enum';
import { User } from 'src/user/entity/user.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { NameRole } from 'src/role/enum/name-role.enum';
import { DeviceRepository } from 'src/device/device.repository';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
import { NotificationService } from 'src/notification/notification.service';
import ContestStatus from 'src/contest/enum/contest-status.enum';
import { LearnerRepository } from 'src/learner/learner.repository';

@Injectable()
export class CustomerDrawingService {
  private logger = new Logger('CustomerDrawingService', { timestamp: true });

  constructor(
    private readonly customerDrawingRepository: CustomerDrawingRepository,
    private readonly userRepository: UserRepository,
    private readonly contestRepository: ContestRepository,
    private readonly s3Service: S3Service,
    private readonly mailService: MailerService,
    private readonly mapper: CustomerDrawingMapper,
    private readonly deviceRepository: DeviceRepository,
    private readonly dynamodbService: DynamodbService,
    private readonly notificationService: NotificationService,
    private readonly learnerRepository: LearnerRepository,
  ) {}

  async createCustomerDrawing(
    request: CreateCustomerDrawingRequest,
    contestId: string,
    userId: string,
  ): Promise<CustomerDrawing> {
    const customer = await this.userRepository.getUserById(userId);
    const contest = await this.contestRepository.getContestById(contestId);
    let flag = true;

    const insertedDate = new Date();
    if (
      insertedDate.getDate() >= contest.startedDate.getDate() &&
      insertedDate.getDate() <= contest.expiredDate.getDate()
    ) {
      const checkedCustomerDrawings =
        await this.customerDrawingRepository.checkCustomerDrawingExisted(
          contest.id,
          customer.id,
        );

      if (checkedCustomerDrawings) {
        for (const customerDrawing of checkedCustomerDrawings) {
          if (customerDrawing) {
            if (customerDrawing.status === CustomerDrawingStatus.APPROVED) {
              flag = false;
              throw new ConflictException('Bạn đã nộp bài dự thi');
            } else if (
              customerDrawing.status === CustomerDrawingStatus.PENDING
            ) {
              flag = false;
              throw new ConflictException(
                'Bạn đã nộp bài dự thi và đang đợi xét duyệt',
              );
            } else if (
              customerDrawing.status === CustomerDrawingStatus.BANNED
            ) {
              flag = false;
              throw new ConflictException('Bạn đã bị chặn khỏi cuộc thi này');
            }
          }
        }
      }

      if (flag) {
        const customerDrawing =
          await this.customerDrawingRepository.createCustomerDrawing(
            request,
            customer,
            contest,
            insertedDate,
          );

        this.logger.log(
          `method=createCustomerDrawing, created customer drawing successfully`,
        );

        const createdCustomerDrawing =
          await this.customerDrawingRepository.saveCustomerDrawing(
            customerDrawing,
          );

        return await this.customerDrawingRepository.getCustomerDrawingByIdForUpdateImageUrl(
          createdCustomerDrawing.id,
        );
      }
    } else {
      throw new InternalServerErrorException(
        'Đã hết hạn nộp bài dự thi hoặc cuộc thi chưa bắt đầu',
      );
    }
  }

  async uploadImageUrl(
    buffer: Buffer,
    type: string,
    substringAfterDot: string,
    customerDrawingId: string,
  ): Promise<void> {
    try {
      const customerDrawing =
        await this.customerDrawingRepository.getCustomerDrawingByIdForUpdateImageUrl(
          customerDrawingId,
        );
      const key = `${CUSTOMER_DRAWING_PATH}${customerDrawing.id}${substringAfterDot}`;

      customerDrawing.imageUrl = key;

      await this.customerDrawingRepository.saveCustomerDrawing(customerDrawing);

      await this.s3Service.putObject(buffer, key, type);

      await this.mailService.sendMail({
        to: customerDrawing.user.email,
        subject: 'Chờ xét duyệt',
        template: './waitingApproval',
        context: {
          CONTENT: `Bài dự thi cuộc thi ${customerDrawing.contest.title} đang chờ xét duyệt`,
        },
      });

      const tokens = await this.deviceRepository.getDeviceByRole(
        NameRole.Staff,
      );

      const usersStaff = await this.userRepository.getUserByRole(
        NameRole.Staff,
      );

      for (const staff of usersStaff) {
        const createNotificationDto = {
          title: 'Xét duyệt bài thi',
          body: `Một người tham dự vừa đăng bài thi tại cuộc thi ${customerDrawing.contest.title}. Hãy xét duyệt!`,
          data: {
            imageUrl: key,
            type: 'STAFF-CUSTOMER_DRAWING',
          },
          userId: staff.id,
        };

        await this.dynamodbService.saveNotification(createNotificationDto);
      }

      tokens.forEach((token) => {
        const payload = {
          token: token.deviceTokenId,
          title: 'Xét duyệt bài thi',
          body: `Một người tham dự vừa đăng bài thi tại cuộc thi ${customerDrawing.contest.title}. Hãy xét duyệt!`,
          data: {
            imageUrl: key,
            type: 'STAFF-CUSTOMER_DRAWING',
          },
          userId: token.user.id,
        };

        this.notificationService.sendingNotification(payload);
      });

      this.logger.log(`method=uploadImageUrl, uploaded thumbnail successfully`);
    } catch (error) {
      this.logger.error(`method=uploadImageUrl, error:${error.message}`);
    }
  }

  async setStatusCustomerDrawing(
    customerDrawingId: string,
    status: CustomerDrawingStatus,
  ): Promise<void> {
    try {
      const customerDrawing =
        await this.customerDrawingRepository.getCustomerDrawingByIdForUpdateImageUrl(
          customerDrawingId,
        );

      if (customerDrawing.contest.status !== ContestStatus.ACTIVE) {
        throw new BadRequestException(
          `Cuộc thi đang không diễn ra nên không thể duyệt bài vẽ`,
        );
      }

      if (status === CustomerDrawingStatus.APPROVED) {
        customerDrawing.active = true;
      }
      customerDrawing.status = status;

      await this.customerDrawingRepository.saveCustomerDrawing(customerDrawing);

      await this.mailService.sendMail({
        to: customerDrawing.user.email,
        subject: 'Xét Duyệt Thành Công',
        template: './approve',
        context: {
          SUBJECT: `Bài dự thi cuộc thi ${customerDrawing.contest.title}`,
          CONTENT: `Đã Được Xét Duyệt`,
        },
      });

      const tokens = await this.deviceRepository.getDeviceByUserId(
        customerDrawing.user.id,
      );

      const createNotificationDto = {
        title: 'Xét duyệt bài thi',
        body: `Bài dự thi cuộc thi ${customerDrawing.contest.title} của bạn đã được xét duyệt thành công`,
        data: {
          customerDrawingId: customerDrawingId,
          contestId: customerDrawing.contest.id,
          type: 'CUSTOMER-CUSTOMER_DRAWING',
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

      this.logger.log(
        `method=approveCustomerDrawing, aprroved customer drawing successfully`,
      );
    } catch (error) {
      this.logger.error(
        `method=approveCustomerDrawing, error:${error.message}`,
      );
    }
  }

  async getCustomerDrawingByContest(
    contestId: string,
    request: FilterCustomerDrawingRequest,
    user: User | Learner,
  ): Promise<PageDto<ViewCustomerDrawingResponse>> {
    let customerDrawings: CustomerDrawing[] = [];
    const responses: ViewCustomerDrawingResponse[] = [];

    const { count, entites } =
      await this.customerDrawingRepository.getCustomerDrawingByContest(
        contestId,
        request,
      );

    customerDrawings = entites;

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: request.pageOptions,
    });

    for (const customerDrawing of customerDrawings) {
      const cusomerName = `${customerDrawing.user.lastName} ${customerDrawing.user.middleName} ${customerDrawing.user.firstName}`;
      const totalVotes = customerDrawing.votes.length;
      let isVoted = false;
      let isOwned = false;

      // ----------------------------------------------------------------
      if (customerDrawing.user.id === user.id) {
        isOwned = true;
      }

      for (const vote of customerDrawing.votes) {
        if (vote?.user?.id === user.id || vote?.learner?.id === user.id) {
          isVoted = true;
        }
      }

      if ((user as User)?.role?.name === NameRole.Customer) {
        const learners = await this.learnerRepository.getLearnerByUserId(
          user.id,
        );

        if (learners.length > 0) {
          for (const vote of customerDrawing.votes) {
            for (const learner of learners) {
              if (vote?.learner?.id === learner.id) {
                isVoted = true;
              }
            }
          }
        }
      }
      // ----------------------------------------------------------------

      responses.push(
        this.mapper.filterViewCustomerDrawingResponseFromCustomerDrawingV2(
          customerDrawing,
          cusomerName,
          totalVotes,
          isVoted,
          isOwned,
        ),
      );
    }

    this.logger.log(`method=getCustomerDrawingByContest, total = ${itemCount}`);

    return new PageDto(responses, pageMetaDto);
  }

  async getCustomerDrawingByContestForGuest(
    contestId: string,
    request: FilterCustomerDrawingRequest,
  ): Promise<PageDto<ViewCustomerDrawingResponse>> {
    let customerDrawings: CustomerDrawing[] = [];
    const responses: ViewCustomerDrawingResponse[] = [];

    const { count, entites } =
      await this.customerDrawingRepository.getCustomerDrawingByContest(
        contestId,
        request,
      );

    customerDrawings = entites;

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: request.pageOptions,
    });

    for (const customerDrawing of customerDrawings) {
      const cusomerName = `${customerDrawing.user.lastName} ${customerDrawing.user.middleName} ${customerDrawing.user.firstName}`;
      const totalVotes = customerDrawing.votes.length;
      const isVoted = false;
      const isOwned = false;

      responses.push(
        this.mapper.filterViewCustomerDrawingResponseFromCustomerDrawingV2(
          customerDrawing,
          cusomerName,
          totalVotes,
          isVoted,
          isOwned,
        ),
      );
    }

    this.logger.log(`method=getCustomerDrawingByContest, total = ${itemCount}`);

    return new PageDto(responses, pageMetaDto);
  }

  async getCustomerDrawingByContestId(
    contestId: string,
    status?: CustomerDrawingStatus,
  ): Promise<CustomerDrawing[]> {
    const customerDrawings =
      await this.customerDrawingRepository.getCustomerDrawingByContestId(
        contestId,
        status,
      );

    return customerDrawings;
  }

  async getCustomerDrawings(
    request: FilterCustomerDrawingRequest,
  ): Promise<PageDto<ViewCustomerDrawingResponse>> {
    let customerDrawings: CustomerDrawing[] = [];
    const responses: ViewCustomerDrawingResponse[] = [];

    const { count, entites } =
      await this.customerDrawingRepository.getCustomerDrawing(request);

    customerDrawings = entites;

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: request.pageOptions,
    });

    for (const customerDrawing of customerDrawings) {
      const cusomerName = `${customerDrawing.user.lastName} ${customerDrawing.user.middleName} ${customerDrawing.user.firstName}`;
      const totalVotes = customerDrawing.votes.length;

      responses.push(
        this.mapper.filterViewCustomerDrawingResponseFromCustomerDrawingV1(
          customerDrawing,
          cusomerName,
          totalVotes,
        ),
      );
    }

    this.logger.log(`method=getCustomerDrawings, total = ${itemCount}`);

    return new PageDto(responses, pageMetaDto);
  }

  async checkCustomerDrawingSubmitted(
    contestId: string,
    userId: string,
  ): Promise<boolean> {
    const customer = await this.userRepository.getUserById(userId);
    const contest = await this.contestRepository.getContestById(contestId);
    let isSubmitted = false;
    const insertedDate = new Date();

    if (
      insertedDate.getDate() >= contest.startedDate.getDate() &&
      insertedDate.getDate() <= contest.expiredDate.getDate()
    ) {
      const checkedCustomerDrawings =
        await this.customerDrawingRepository.checkCustomerDrawingExisted(
          contest.id,
          customer.id,
        );

      if (checkedCustomerDrawings) {
        for (const customerDrawing of checkedCustomerDrawings) {
          if (customerDrawing) {
            if (customerDrawing.status === CustomerDrawingStatus.APPROVED) {
              isSubmitted = true;
            } else if (
              customerDrawing.status === CustomerDrawingStatus.PENDING
            ) {
              isSubmitted = true;
            } else if (
              customerDrawing.status === CustomerDrawingStatus.BANNED
            ) {
              isSubmitted = true;
            }
          }
        }
      }
    }

    return isSubmitted;
  }

  async getCustomerDrawingOfCustomerInContest(
    user: User | Learner,
    contestId: string,
  ) {
    if (user.role === NameRole.Learner)
      return await this.customerDrawingRepository.checkCustomerDrawingExisted(
        contestId,
        (user as Learner).user.id,
      );

    return await this.customerDrawingRepository.checkCustomerDrawingExisted(
      contestId,
      user.id,
    );
  }
}
