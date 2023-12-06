import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PromotionCourseRepository } from './promotion-course.repository';
import { NameRole } from 'src/role/enum/name-role.enum';
import { PromotionCourse } from './entity/promotion-course.entity';
import { CheckPromotionCourseRequest } from './request/check-promotion-course-request.dto';
import { CreatePromotionCourseRequest } from './request/create-promotion-course-request.dto';
import { User } from 'src/user/entity/user.entity';
import { PromotionRepository } from 'src/promotion/promotion.repository';
import { CourseRepository } from 'src/course/course.repository';
import { UpdateIsViewOfStaffRequest } from './request/update-is-view-of-staff.request.dto';

@Injectable()
export class PromotionCourseService {
  private logger = new Logger('PromotionCourseService', { timestamp: true });

  constructor(
    private promotionCourseRepository: PromotionCourseRepository,
    private promotionRepository: PromotionRepository,
    private courseRepository: CourseRepository,
  ) {}

  async checkPromotionCourseCanApplyById(promotionCourseId: string) {
    const promotionCourse =
      await this.promotionCourseRepository.getPromotionCourseCanApplyById(
        promotionCourseId,
      );

    if (promotionCourse.used >= promotionCourse.promotion.amount)
      return { promotionCourse: null };

    return { promotionCourse };
  }

  async checkPromotionCourseCanApplyByCode(code: string, courseId: string) {
    const promotionCourse =
      await this.promotionCourseRepository.getPromotionCourseCanApplyByCode(
        code,
        courseId,
      );

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
      // promotionCourse.active = false;
      // this.promotionCourseRepository.savePromotionCourse(promotionCourse);
      // this.logger.log(
      //   `method=removePromotionCourse, PromotionCourse with id=${id} has cartItems and orderDetails => active=false`,
      // );
      throw new NotAcceptableException(
        `PromotionCourse with id=${id} has cartItems and orderDetails`,
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
  ): Promise<PromotionCourse[]> {
    return (
      await this.promotionCourseRepository.getPromotionCoursesViewByCourseId(
        courseId,
      )
    ).filter(
      (promotionCourse) =>
        promotionCourse.used < promotionCourse.promotion.amount,
    );
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
