import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { PromotionCourseRepository } from './promotion-course.repository';
import { NameRole } from 'src/role/enum/name-role.enum';
import { PromotionCourse } from './entity/promotion-course.entity';
import { CheckPromotionCourseRequest } from './request/check-promotion-course-request.dto';

@Injectable({ scope: Scope.REQUEST })
export class PromotionCourseService {
  private logger = new Logger('CartService', { timestamp: true });

  constructor(
    private promotionCourseRepository: PromotionCourseRepository,
    @Inject(REQUEST) private request: Request,
  ) {}

  async checkPromotionCourseCanApplyOfInstructor({
    code,
    courseId,
  }: CheckPromotionCourseRequest) {
    let promotionCourse: PromotionCourse = null;
    const promotionCourses =
      await this.promotionCourseRepository.getPromotionCoursesByCourseIdCanApply(
        courseId,
        NameRole.Instructor,
      );

    promotionCourses.forEach((currPromotionCourse) => {
      if (currPromotionCourse.code === code) {
        promotionCourse = currPromotionCourse;
      }
    });
    return { promotionCourse };
  }
}
