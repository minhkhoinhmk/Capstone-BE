import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CourseFeedback } from './entity/course-feedbacl.entity';
import { CourseFeedbackService } from './course-feedback.service';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { CourseFeedbackResponse } from './dto/response/course-feedback-response.dto';

@Controller('course-feedback')
export class CourseFeedbackController {
  constructor(private courseFeedbackService: CourseFeedbackService) {}

  @Post('courses/:id')
  @ApiPaginatedResponse(CourseFeedback)
  findAll(
    @Body() pageOption: PageOptionsDto,
    @Param('id') id: string,
  ): Promise<PageDto<CourseFeedbackResponse>> {
    return this.courseFeedbackService.getCourseFeedbackByCourseId(
      id,
      pageOption,
    );
  }
}
