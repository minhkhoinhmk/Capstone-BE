import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { PromotionCourse } from './entity/promotion-course.entity';
import { RoleRepository } from 'src/role/role.repository';
import { dateInVietnam } from 'src/utils/date-vietnam.util';
import Promotion from 'src/promotion/entity/promotion.entity';

@Injectable()
export class PromotionCourseRepository {
  private logger = new Logger('PromotionCourseRepository', { timestamp: true });

  constructor(
    @InjectRepository(PromotionCourse)
    private promotionCourseRepository: Repository<PromotionCourse>,
    private roleRepository: RoleRepository,
  ) {}

  async getPromotionCoursesWinnerByUserId(userId: string) {
    const date = dateInVietnam();

    const promotionCourses = await this.promotionCourseRepository.find({
      where: {
        active: true,
        isFull: true,
        promotion: {
          effectiveDate: LessThanOrEqual(date),
          expiredDate: MoreThanOrEqual(date),
          active: true,
          winners: {
            customerDrawing: {
              user: { id: userId },
            },
          },
        },
      },
      relations: {
        promotion: {
          user: true,
        },
        orderDetails: true,
        cartItems: true,
      },
    });

    return promotionCourses;
  }

  async getPromotionCoursesViewByCourseId(courseId: string) {
    const date = dateInVietnam();

    const promotionCourses = await this.promotionCourseRepository.find({
      where: {
        course: {
          id: courseId,
        },
        active: true,
        isView: true,
        isFull: false,
        promotion: {
          effectiveDate: LessThanOrEqual(date),
          expiredDate: MoreThanOrEqual(date),
          active: true,
        },
      },
      relations: {
        promotion: {
          user: true,
        },
        orderDetails: true,
        cartItems: true,
      },
    });
    return promotionCourses;
  }

  async getPromotionCourseCanApplyByCodeInstructor(
    code: string,
    courseId: string,
  ) {
    const date = dateInVietnam();

    const promotionCourse = await this.promotionCourseRepository.findOne({
      where: {
        course: { id: courseId },
        active: true,
        // isView: false,
        isFull: false,
        promotion: {
          code,
          effectiveDate: LessThanOrEqual(date),
          expiredDate: MoreThanOrEqual(date),
          active: true,
        },
      },
      relations: {
        promotion: {
          user: true,
        },
        orderDetails: true,
        cartItems: true,
      },
    });

    return promotionCourse;
  }

  async getPromotionCourseCanApplyByCodeForWinner(
    code: string,
    userId: string,
  ) {
    const date = dateInVietnam();

    const promotionCourse = await this.promotionCourseRepository.findOne({
      where: {
        active: true,
        isFull: true,
        promotion: {
          code,
          effectiveDate: LessThanOrEqual(date),
          expiredDate: MoreThanOrEqual(date),
          active: true,
          winners: {
            customerDrawing: {
              user: { id: userId },
            },
          },
        },
      },
      relations: {
        promotion: {
          user: true,
        },
        orderDetails: true,
        cartItems: true,
      },
    });

    return promotionCourse;
  }

  async getPromotionCourseById(id: string) {
    const promotionCourse = await this.promotionCourseRepository.findOne({
      where: {
        id,
      },
      relations: {
        promotion: {
          user: true,
        },
        orderDetails: true,
        cartItems: true,
      },
    });
    return promotionCourse;
  }

  async getPromotionCoursesByPromotionId(promotionId: string) {
    const promotionCourses = await this.promotionCourseRepository.find({
      where: {
        promotion: {
          id: promotionId,
        },
      },
      relations: {
        promotion: true,
        course: true,
        orderDetails: true,
        cartItems: true,
      },
    });
    return promotionCourses;
  }

  async savePromotionCourse(promotionCourse: PromotionCourse) {
    return await this.promotionCourseRepository.save(promotionCourse);
  }

  async removePromotionCourse(promotionCourse: PromotionCourse) {
    return await this.promotionCourseRepository.remove(promotionCourse);
  }

  createPromotionCourseByStaff(promotion: Promotion) {
    return this.promotionCourseRepository.create({
      promotion,
      active: true,
      course: null,
      isView: true,
      isFull: true,
      used: 0,
    });
  }
}
