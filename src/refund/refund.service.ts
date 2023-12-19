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
import { MailerService } from '@nestjs-modules/mailer';
import { LearnerCourseRepository } from 'src/learner-course/learner-course.repository';
import { dateInVietnam } from 'src/utils/date-vietnam.util';
import { CourseFeedbackRepository } from 'src/course-feedback/course-feedback.repository';
import { format } from 'date-fns';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
import { UserRepository } from 'src/user/user.repository';

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
    private mailsService: MailerService,
    private readonly learnerCourseRepository: LearnerCourseRepository,
    private readonly courseFeedbackRepository: CourseFeedbackRepository,
    private readonly dynamodbService: DynamodbService,
    private readonly userRepository: UserRepository,
  ) {}

  async createRefund(
    request: CreateRefundRequest,
    orderDetailId: string,
  ): Promise<void> {
    const orderDetail = await this.orderDetailRepository.getOrderDetailById(
      orderDetailId,
    );

    if (this.isOverThirtyDaysAgo(orderDetail.order.insertedDate)) {
      this.logger.error(
        `method=createRefund, orderId=${orderDetail.order.id} is more than 30 days`,
      );
      throw new BadRequestException(`Đơn hàng này đã quá 30 ngày giao dịch`);
    }

    let isAvailableRefund = true;

    const course = await this.courseRepository.getCourseById(
      orderDetail.course.id,
    );

    let countLectureCompleted = await this.countCompletedLectureForCustomer(
      course,
      orderDetail.order.user.id,
    );

    if (
      Math.floor(
        (countLectureCompleted / course.chapterLectures.length) * 100,
      ) > 20
    )
      isAvailableRefund = false;

    if (isAvailableRefund) {
      const learnerCourse =
        await this.learnerCourseRepository.getLearnerCourseByCourseAndCustomer(
          course.id,
          orderDetail.order.user.id,
        );

      if (learnerCourse) {
        countLectureCompleted = await this.countCompletedLectureForLearner(
          course,
          learnerCourse.learner.id,
        );

        if (
          Math.floor(
            (countLectureCompleted / course.chapterLectures.length) * 100,
          ) > 20
        )
          isAvailableRefund = false;
      }
    }

    if (!isAvailableRefund) {
      this.logger.error(
        `method=createRefund, userId=${orderDetail.order.user.id} studied more than 20%`,
      );
      throw new BadRequestException(
        `Bạn hoặc người thân đã học khóa học này hơn 20%`,
      );
    } else {
      try {
        const refund = await this.refundRepository.createRefund(
          request,
          orderDetail.priceAfterPromotion,
          orderDetail,
        );

        const result = await this.refundRepository.saveRefund(refund);

        const tokens = await this.deviceRepository.getDeviceByRole(
          NameRole.Admin,
        );

        const usersAdmin = await this.userRepository.getUserByRole(
          NameRole.Admin,
        );

        for (const admin of usersAdmin) {
          const createNotificationDto = {
            title: 'Yêu cầu hoàn tiền',
            body: `Bạn nhận được một yêu cầu hoàn tiền từ ${orderDetail.order.user.firstName} cho khóa học ${orderDetail.course.title}`,
            data: {
              refundId: result.id,
              type: 'ADMIN-REFUND',
            },
            userId: admin.id,
          };

          await this.dynamodbService.saveNotification(createNotificationDto);
        }

        tokens.forEach((token) => {
          const payload = {
            token: token.deviceTokenId,
            title: 'Yêu cầu hoàn tiền',
            body: `Bạn nhận được một yêu cầu hoàn tiền từ ${orderDetail.order.user.firstName} cho khóa học ${orderDetail.course.title}`,
            data: {
              refundId: result.id,
              type: 'ADMIN-REFUND',
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
            `Bạn đã yêu cầu hoàn tiền ở khóa học này`,
          );
        }
      }
    }
  }

  isOverThirtyDaysAgo(dateToCheck: Date): boolean {
    const currentDate = dateInVietnam();
    const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;

    const currentTimeInMillis = currentDate.getTime();
    const specifiedTimeInMillis = dateToCheck.getTime();

    const differenceInMillis = currentTimeInMillis - specifiedTimeInMillis;

    return differenceInMillis > thirtyDaysInMillis;
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

  async getRefunds(isApproved: boolean | undefined): Promise<RefundResponse[]> {
    const { count, entities } = await this.refundRepository.getRefunds(
      isApproved,
    );

    const responses: RefundResponse[] = [];

    for (const refund of entities) {
      responses.push(this.refundMapper.filterRefundResponseFromRefund(refund));
    }

    this.logger.log(`method=getRefunds, totalItems=${count}`);

    return responses;
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

  async getRefundByCustomerId(id: string): Promise<RefundResponse[]> {
    const { count, entities } =
      await this.refundRepository.getRefundByCustomerId(id);

    const responses: RefundResponse[] = [];

    for (const refund of entities) {
      responses.push(this.refundMapper.filterRefundResponseFromRefund(refund));
    }

    this.logger.log(`method=getRefundByCustomerId, totalItems=${count}`);

    return responses;
  }

  async approveRefund(id: string): Promise<void> {
    const refund = await this.refundRepository.getRefundById(id);

    refund.isApproved = true;

    this.refundRepository.saveRefund(refund);

    // const orderDetail = await this.orderDetailRepository.getOrderDetailById(
    //   refund.orderDetail.id,
    // );
    // orderDetail.active = false;
    // await this.orderDetailRepository.saveOrderDetail(orderDetail);

    const userLecturesOfUser =
      await this.userLectureRepository.getUserLectureByCourseAndCustomer(
        refund.orderDetail.course.id,
        refund.orderDetail.order.user.id,
      );

    const learnerCourse =
      await this.learnerCourseRepository.getLearnerCourseByCourseAndCustomer(
        refund.orderDetail.course.id,
        refund.orderDetail.order.user.id,
      );

    let userLecturesOfLearner, courseFeedbackOfLearner;

    if (learnerCourse) {
      userLecturesOfLearner =
        await this.userLectureRepository.getUserLectureByCourseAndLearner(
          refund.orderDetail.course.id,
          learnerCourse.learner.id,
        );

      courseFeedbackOfLearner =
        await this.courseFeedbackRepository.checkCourseFeedbackExistedByLearner(
          refund.orderDetail.course.id,
          learnerCourse.learner.id,
        );
    }

    const courseFeedbackOfUser =
      await this.courseFeedbackRepository.checkCourseFeedbackExistedByUser(
        refund.orderDetail.course.id,
        refund.orderDetail.order.user.id,
      );

    if (userLecturesOfLearner) {
      for (const userLectureOfLearner of userLecturesOfLearner) {
        await this.userLectureRepository.remove(userLectureOfLearner);
      }
    }

    if (userLecturesOfUser) {
      for (const userLectureOfUser of userLecturesOfUser) {
        await this.userLectureRepository.remove(userLectureOfUser);
      }
    }

    if (courseFeedbackOfUser) {
      await this.courseFeedbackRepository.remove(courseFeedbackOfUser);
    }

    if (courseFeedbackOfLearner) {
      await this.courseFeedbackRepository.remove(courseFeedbackOfLearner);
    }

    if (learnerCourse) {
      await this.learnerCourseRepository.removeLearnerCourse(learnerCourse);
    }

    await this.mailsService.sendMail({
      to: refund.orderDetail.order.user.email,
      subject: 'Đồng ý xét duyệt',
      template: './approveRefund',
      context: {
        SUBJECT: 'hoàn tiền khóa học',
        CONTENT: 'Đã được chấp thuận',
      },
    });

    const tokens = await this.deviceRepository.getDeviceByUserId(
      refund.orderDetail.order.user.id,
    );

    const createNotificationDto = {
      title: 'Yêu cầu hoàn tiền',
      body: `Yêu cầu hoàn tiền khóa học ${refund.orderDetail.course.title} của bạn đã được chấp nhận`,
      data: {
        refundId: refund.id,
        type: 'CUSTOMER-REFUND',
      },
      userId: refund.orderDetail.order.user.id,
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

      this.noftificationService.sendingNotification(payload);
    });
  }

  async checkIsRefund(orderDetailId: string): Promise<boolean> {
    const refund = await this.refundRepository.getRefundByOrderDetail(
      orderDetailId,
    );
    let isRefund = true;

    if (refund) {
      isRefund = false;
    } else {
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

      if (this.isOverThirtyDaysAgo(orderDetail.order.insertedDate)) {
        isRefund = false;
      } else {
        if (
          Math.floor(
            (countLectureCompleted / course.chapterLectures.length) * 100,
          ) > 20
        ) {
          isRefund = false;
        }

        if (isRefund) {
          const learnerCourse =
            await this.learnerCourseRepository.getLearnerCourseByCourseAndCustomer(
              course.id,
              orderDetail.order.user.id,
            );

          if (learnerCourse) {
            countLectureCompleted = await this.countCompletedLectureForLearner(
              course,
              learnerCourse.learner.id,
            );

            if (
              Math.floor(
                (countLectureCompleted / course.chapterLectures.length) * 100,
              ) > 20
            )
              isRefund = false;
          }
        }
      }
    }
    return isRefund;
  }

  async questionRefund(refundId: string, question: string): Promise<void> {
    const refund = await this.refundRepository.getRefundById(refundId);

    if (refund) {
      await this.mailsService.sendMail({
        to: refund.orderDetail.order.user.email,
        subject: 'Vấn đề hoàn tiền',
        template: './questionRefund',
        context: {
          COURSE: `${refund.orderDetail.course.title}`,
          DATE: `${format(refund.insertedDate, 'dd-MM-yyyy')}`,
          PROBLEM: `${question}`,
        },
      });
    }
  }
}
