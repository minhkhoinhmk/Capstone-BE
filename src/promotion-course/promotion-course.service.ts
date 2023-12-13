import {
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PromotionCourseRepository } from './promotion-course.repository';
import { NameRole } from 'src/role/enum/name-role.enum';
import { PromotionCourse } from './entity/promotion-course.entity';
import { CreatePromotionCourseRequest } from './request/create-promotion-course-request.dto';
import { User } from 'src/user/entity/user.entity';
import { PromotionRepository } from 'src/promotion/promotion.repository';
import { CourseRepository } from 'src/course/course.repository';
import { UpdateIsViewOfStaffRequest } from './request/update-is-view-of-staff.request.dto';
import { isWithinInterval, parseISO } from 'date-fns';

@Injectable()
export class PromotionCourseService {
  private logger = new Logger('PromotionCourseService', { timestamp: true });

  constructor(
    private promotionCourseRepository: PromotionCourseRepository,
    private promotionRepository: PromotionRepository,
    private courseRepository: CourseRepository,
  ) {}

  async checkPromotionCourseCanApplyByCode(
    code: string,
    courseId: string,
    userId: string,
  ) {
    let promotionCourse =
      await this.promotionCourseRepository.getPromotionCourseCanApplyByCodeInstructor(
        code,
        courseId,
      );

    promotionCourse =
      promotionCourse === null
        ? await this.promotionCourseRepository.getPromotionCourseCanApplyByCodeForWinner(
            code,
            userId,
          )
        : promotionCourse;

    if (!promotionCourse) {
      this.logger.error(
        `method=checkPromotionCourseCanApplyByCode, code=${code} is not found`,
      );
      throw new BadRequestException(`Mã "${code}" không hợp lệ`);
    }

    if (promotionCourse.used >= promotionCourse.promotion.amount)
      return { promotionCourse: null };

    return { promotionCourse };
  }

  async createPromotionCourse(
    body: CreatePromotionCourseRequest,
    user: User,
  ): Promise<void> {
    const course = await this.courseRepository.getCourseById(body.courseId);
    const promotion = await this.promotionRepository.getPromotionById(
      body.promotionId,
    );

    if (!course || !promotion) {
      this.logger.error(
        `method=createPromotionCourse, promotionId=${body.promotionId} or courseId=${body.courseId} is not found`,
      );
      throw new NotFoundException(
        `promotionId=${body.promotionId} or courseId=${body.courseId} is not found`,
      );
    }

    if (user.role.name === NameRole.Instructor) {
      const promotionsOfInstructor =
        await this.promotionRepository.getAllPromotionsActiveByUserId(user.id);

      for (const currPromotion of promotionsOfInstructor) {
        if (
          currPromotion.id !== promotion.id &&
          currPromotion.discountPercent === promotion.discountPercent &&
          this.checkOverlapTimes(
            currPromotion.effectiveDate,
            currPromotion.expiredDate,
            promotion.effectiveDate,
            promotion.expiredDate,
          )
        ) {
          for (const currPromotionCourse of currPromotion.promotionCourses) {
            if (currPromotionCourse.course.id === course.id) {
              this.logger.error(
                `method=createPromotionCourse, promotionId=${body.promotionId} with courseId=${body.courseId} is not valid`,
              );
              throw new NotFoundException(
                `Giảm giá không thể áp dụng cho khóa học ${course.title} vì đang được chọn ở mã giảm giá khác với thời gian bị trùng nhau`,
              );
            }
          }
        }
      }
    }

    const promotionCourse = new PromotionCourse();
    promotionCourse.isView = body.isView;
    promotionCourse.isFull = user.role.name === NameRole.Staff ? true : false;
    promotionCourse.used = 0;
    promotionCourse.active = true;
    promotionCourse.course = course;
    promotionCourse.promotion = promotion;

    await this.promotionCourseRepository.savePromotionCourse(promotionCourse);

    this.logger.log(
      `method=createPromotionCourse, Promotion Course created successfully`,
    );
  }

  checkOverlapTimes(
    time1StartDate: Date,
    time1EndDate: Date,
    time2StartDate: Date,
    time2EndDate: Date,
  ) {
    const time1Start = parseISO(time1StartDate.toISOString());
    const time1End = parseISO(time1EndDate.toISOString());
    const time2Start = parseISO(time2StartDate.toISOString());
    const time2End = parseISO(time2EndDate.toISOString());

    return (
      isWithinInterval(time2Start, {
        start: time1Start,
        end: time1End,
      }) || isWithinInterval(time2End, { start: time1Start, end: time1End })
    );
  }

  async removePromotionCourse(id: string): Promise<void> {
    const promotionCourse =
      await this.promotionCourseRepository.getPromotionCourseById(id);

    if (!promotionCourse) {
      this.logger.error(
        `method=removePromotionCourse, promotionCourseId=${id} is not found`,
      );
      throw new NotFoundException(`promotionCourseId=${id} is not found`);
    }

    if (
      promotionCourse.cartItems.length <= 0 &&
      promotionCourse.orderDetails.length <= 0
    ) {
      await this.promotionCourseRepository.removePromotionCourse(
        promotionCourse,
      );

      this.logger.log(`PromotionCourse with id=${id} removed successfully`);
    } else {
      this.logger.error(
        `method=removePromotionCourse, PromotionCourse with id=${id} has cartItems and orderDetails`,
      );
      throw new NotAcceptableException(
        `Giảm giá dành cho khóa học này đã có trong giỏ hàng hay đã có khách hàng sử dụng`,
      );
    }
  }

  async getPromotionCourseById(id: string): Promise<PromotionCourse> {
    return this.promotionCourseRepository.getPromotionCourseById(id);
  }

  async getPromotionCoursesByPromotionId(
    id: string,
  ): Promise<PromotionCourse[]> {
    return this.promotionCourseRepository.getPromotionCoursesByPromotionId(id);
  }

  async getPromotionCoursesCanViewByCourseId(
    courseId: string,
    customer: User,
  ): Promise<PromotionCourse[]> {
    let promotionCoursesViewInstructor =
      await this.promotionCourseRepository.getPromotionCoursesViewByCourseId(
        courseId,
      );

    promotionCoursesViewInstructor =
      this.removeUsedExccedAmountPromotionCourses(
        promotionCoursesViewInstructor,
      );

    promotionCoursesViewInstructor = this.removeDuplicatePromotionCourses(
      promotionCoursesViewInstructor,
    );

    let promotionCoursesWinner =
      await this.promotionCourseRepository.getPromotionCoursesWinnerByUserId(
        customer.id,
      );

    promotionCoursesWinner = this.removeUsedExccedAmountPromotionCourses(
      promotionCoursesWinner,
    );

    return [...promotionCoursesViewInstructor, ...promotionCoursesWinner];
  }

  removeUsedExccedAmountPromotionCourses(
    promotionCourses: PromotionCourse[],
  ): PromotionCourse[] {
    return promotionCourses.filter(
      (promotionCourse) =>
        promotionCourse.used < promotionCourse.promotion.amount,
    );
  }

  removeDuplicatePromotionCourses(
    promotionCourses: PromotionCourse[],
  ): PromotionCourse[] {
    const discountMap: { [key: number]: boolean } = {};

    return promotionCourses.filter((promotionCourse) => {
      if (discountMap[promotionCourse.promotion.discountPercent]) {
        return false; // Đã gặp giá trị discountPercent này trước đó
      } else {
        discountMap[promotionCourse.promotion.discountPercent] = true;
        return true; // Chưa gặp giá trị discountPercent này trước đó
      }
    });
  }

  async updateIsViewOfInstructor(
    body: UpdateIsViewOfStaffRequest,
  ): Promise<void> {
    const promotionCourse =
      await this.promotionCourseRepository.getPromotionCourseById(
        body.promotionCourseId,
      );

    if (!promotionCourse) {
      this.logger.error(
        `method=removePromotionCourse, promotionCourseId=${body.promotionCourseId} is not found`,
      );
      throw new NotFoundException(
        `promotionCourseId=${body.promotionCourseId} is not found`,
      );
    }

    promotionCourse.isView = body.isView;
    await this.promotionCourseRepository.savePromotionCourse(promotionCourse);
  }
}
