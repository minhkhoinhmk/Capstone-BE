import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderDetailRepository } from 'src/order-detail/order-detail.repository';
import { UserLectureRepository } from 'src/user-lecture/user-lecture.repository';
import { CreateRefundRequest } from './dto/request/create-refund-request.dto';
import { CourseRepository } from 'src/course/course.repository';
import { Course } from 'src/course/entity/course.entity';
import { RefundRepository } from './refund.repository';
import { NotificationService } from 'src/notification/notification.service';
import { DeviceRepository } from 'src/device/device.repository';
import { NameRole } from 'src/role/enum/name-role.enum';
import { RefundMapper } from './mapper/refund.mapper';
import { RefundResponse } from './dto/response/refund-response.dto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';

@Injectable()
export class RefundService {
  private logger = new Logger('RefundService', { timestamp: true });

  constructor(
    private readonly orderDetailRepository: OrderDetailRepository,
    private readonly userLectureRepository: UserLectureRepository,
    private readonly courseRepository: CourseRepository,
    private readonly refundRepository: RefundRepository,
    private readonly noftificationService: NotificationService,
    private readonly deviceRepository: DeviceRepository,
    private readonly refundMapper: RefundMapper,
  ) {}

  async createRefund(
    request: CreateRefundRequest,
    orderDetailId: string,
  ): Promise<void> {
    const orderDetail = await this.orderDetailRepository.getOrderDetailById(
      orderDetailId,
    );

    const course = await this.courseRepository.getCourseById(
      orderDetail.course.id,
    );

    let countLectureCompleted = await this.countCompletedLectureForCustomer(
      course,
      orderDetail.order.user.id,
    );

    if (countLectureCompleted == 0) {
      countLectureCompleted = await this.countCompletedLectureForLearner(
        course,
        orderDetail.order.user.id,
      );
    }

    if (
      Math.floor(
        (countLectureCompleted / course.chapterLectures.length) * 100,
      ) > 20
    ) {
      this.logger.error(
        `method=createRefund, userId=${orderDetail.order.user.id} studied more than 20%`,
      );
      throw new BadRequestException(`User studied more than 20%`);
    } else {
      try {
        const refund = await this.refundRepository.createRefund(
          request,
          orderDetail.price,
          orderDetail,
        );

        const result = await this.refundRepository.saveRefund(refund);

        const tokens = await this.deviceRepository.getDeviceByRole(
          NameRole.Admin,
        );

        tokens.forEach((token) => {
          const payload = {
            token: token.deviceTokenId,
            title: 'Yêu cầu hoàn tiền',
            body: `Bạn nhận được một yêu cầu hoàn tiền từ ${orderDetail.order.user.firstName} cho khóa học ${orderDetail.course.title}`,
            data: {
              refundId: result.id,
            },
            userId: token.user.id,
          };

          this.noftificationService.sendingNotification(payload);
        });

        this.logger.log(
          `method=createRefund, userId=${orderDetail.order.user.id} created refund successfully`,
        );
      } catch (error) {
        if (error.code === '23505') {
          throw new ConflictException(
            `Refund with orderDetail: ${orderDetail.id} was existed`,
          );
        }
      }
    }
  }

  async countCompletedLectureForCustomer(
    course: Course,
    customerId: string,
  ): Promise<number> {
    let count = 0;
    for (const chapter of course.chapterLectures) {
      if (
        await this.userLectureRepository.checkChapterLectureIsCompletedForCustomer(
          chapter.id,
          customerId,
        )
      ) {
        count++;
      }
    }

    return count;
  }

  async countCompletedLectureForLearner(
    course: Course,
    customerId: string,
  ): Promise<number> {
    let count = 0;
    for (const chapter of course.chapterLectures) {
      if (
        await this.userLectureRepository.checkChapterLectureIsCompletedForRefund(
          chapter.id,
          customerId,
        )
      ) {
        count++;
      }
    }

    return count;
  }

  async getRefunds(
    pageOption: PageOptionsDto,
  ): Promise<PageDto<RefundResponse>> {
    const { count, entities } = await this.refundRepository.getRefunds(
      pageOption,
    );

    const responses: RefundResponse[] = [];

    for (const refund of entities) {
      responses.push(this.refundMapper.filterRefundResponseFromRefund(refund));
    }

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
    });

    this.logger.log(`method=getRefunds, totalItems=${count}`);

    return new PageDto(responses, pageMetaDto);
  }

  async getRefundById(id: string): Promise<RefundResponse> {
    const refund = await this.refundRepository.getRefundById(id);

    if (!refund) {
      this.logger.error(`method=getRefundById, id=${id} not found`);
      throw new NotFoundException(`Refund with id ${id} not found`);
    }

    this.logger.log(`method=getRefundById, id=${id}`);

    return this.refundMapper.filterRefundResponseFromRefund(refund);
  }

  async getRefundByCustomerId(
    id: string,
    pageOption: PageOptionsDto,
  ): Promise<PageDto<RefundResponse>> {
    const { count, entities } =
      await this.refundRepository.getRefundByCustomerId(id, pageOption);

    const responses: RefundResponse[] = [];

    for (const refund of entities) {
      responses.push(this.refundMapper.filterRefundResponseFromRefund(refund));
    }

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
    });

    this.logger.log(`method=getRefundByCustomerId, totalItems=${count}`);

    return new PageDto(responses, pageMetaDto);
  }
}
