import {
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
  ) {}

  async createCustomerDrawing(
    request: CreateCustomerDrawingRequest,
    contestId: string,
    userId: string,
  ): Promise<CustomerDrawing> {
    const customer = await this.userRepository.getUserById(userId);
    const contest = await this.contestRepository.getContestById(contestId);
    let flag: boolean = true;

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

      console.log(flag);

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
      let customerDrawing =
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

      this.logger.log(`method=uploadImageUrl, uploaded thumbnail successfully`);
    } catch (error) {
      this.logger.error(`method=uploadImageUrl, error:${error.message}`);
    }
  }

  async approveCustomerDrawing(customerDrawingId: string): Promise<void> {
    try {
      const customerDrawing =
        await this.customerDrawingRepository.getCustomerDrawingByIdForUpdateImageUrl(
          customerDrawingId,
        );

      customerDrawing.active = true;
      customerDrawing.status = CustomerDrawingStatus.APPROVED;

      await this.customerDrawingRepository.saveCustomerDrawing(customerDrawing);

      // await this.mailService.sendMail({
      //   to: customerDrawing.user.email,
      //   subject: 'xét duyệt thành công',
      //   template: './waitingApproval',
      //   context: {
      //     CONTENT: `Bài dự thi cuộc thi ${customerDrawing.contest.title} đang chờ xét duyệt`,
      //   },
      // });

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

      responses.push(
        this.mapper.filterViewCustomerDrawingResponseFromCustomerDrawing(
          customerDrawing,
          cusomerName,
          totalVotes,
        ),
      );
    }

    this.logger.log(`method=getCustomerDrawingByContest, total = ${itemCount}`);

    return new PageDto(responses, pageMetaDto);
  }

  async getCustomerDrawingByContestId(
    contestId: string,
  ): Promise<CustomerDrawing[]> {
    const customerDrawings =
      await this.customerDrawingRepository.getCustomerDrawingByContestId(
        contestId,
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
        this.mapper.filterViewCustomerDrawingResponseFromCustomerDrawing(
          customerDrawing,
          cusomerName,
          totalVotes,
        ),
      );
    }

    this.logger.log(`method=getCustomerDrawings, total = ${itemCount}`);

    return new PageDto(responses, pageMetaDto);
  }
}
