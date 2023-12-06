import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { PromotionCourse } from './entity/promotion-course.entity';
import { NameRole } from 'src/role/enum/name-role.enum';
import { RoleRepository } from 'src/role/role.repository';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

@Injectable()
export class PromotionCourseRepository {
  private logger = new Logger('PromotionCourseRepository', { timestamp: true });

  constructor(
    @InjectRepository(PromotionCourse)
    private promotionCourseRepository: Repository<PromotionCourse>,
    private roleRepository: RoleRepository,
  ) {}

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

  async getPromotionCourseCanApplyById(id: string) {
    const date = dateInVietnam();

    const promotionCourse = await this.promotionCourseRepository.findOne({
      where: {
        id,
        active: true,
        isView: true,
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
    return promotionCourse;
  }

  async getPromotionCourseCanApplyByCode(code: string, courseId: string) {
    const date = dateInVietnam();

    const promotionCourse = await this.promotionCourseRepository.findOne({
      where: {
        course: { id: courseId },
        active: true,
        isView: false,
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

  async getPromotionCourseActiveById(id: string) {
    const promotionCourse = await this.promotionCourseRepository.findOne({
      where: {
        id,
        active: true,
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
}
