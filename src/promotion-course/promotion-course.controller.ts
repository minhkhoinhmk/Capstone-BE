import { Body, Controller, Post } from '@nestjs/common';
import { PromotionCourseService } from './promotion-course.service';
import { CheckPromotionCourseRequest } from './request/check-promotion-course-request.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('promotion-course')
@ApiTags('Promotion Course')
export class PromotionCourseController {
  constructor(private promotionCourseService: PromotionCourseService) {}

  @Post('/apply')
  checkPromotionCourseCanApply(
    @Body() checkPromotionCourseRequest: CheckPromotionCourseRequest,
  ) {
    return this.promotionCourseService.checkPromotionCourseCanApplyOfInstructor(
      checkPromotionCourseRequest,
    );
  }
}
