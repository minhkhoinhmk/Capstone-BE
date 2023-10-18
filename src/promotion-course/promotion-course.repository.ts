import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { PromotionCourse } from './entity/promotion-course.entity';
import { NameRole } from 'src/role/enum/name-role.enum';
import { RoleRepository } from 'src/role/role.repository';

@Injectable()
export class PromotionCourseRepository {
  private logger = new Logger('PromotionCourseRepository', { timestamp: true });

  constructor(
    @InjectRepository(PromotionCourse)
    private promotionCourseRepository: Repository<PromotionCourse>,
    private roleRepository: RoleRepository,
  ) {}

  async getPromotionCoursesByCourseIdCanApply(
    courseId: string,
    userNameRole?: NameRole,
  ): Promise<PromotionCourse[]> {
    const date = new Date();
    const role = await this.roleRepository.getRoleByName(userNameRole);

    const promotionCourses = await this.promotionCourseRepository.find({
      where: {
        active: true,
        course: { id: courseId },
        effectiveDate: LessThanOrEqual(date),
        expiredDate: MoreThanOrEqual(date),
        promotion: {
          active: true,
        },
      },
      relations: {
        promotion: {
          user: {
            roles: true,
          },
        },
      },
    });

    return promotionCourses.filter((promotionCourse) => {
      return promotionCourse.promotion.user.roles.some(
        (role) => role.name === userNameRole,
      );
    });
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
      },
    });
    return promotionCourse;
  }
}
