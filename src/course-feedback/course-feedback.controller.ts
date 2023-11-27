import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CourseFeedback } from './entity/course-feedbacl.entity';
import { CourseFeedbackService } from './course-feedback.service';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { CourseFeedbackResponse } from './dto/response/course-feedback-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateCourseFeedbackRequest } from './dto/request/create-course-feedback-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';

@Controller('course-feedback')
@ApiTags('Course Feedback')
export class CourseFeedbackController {
  constructor(private courseFeedbackService: CourseFeedbackService) {}

  @Post('/courses/:id')
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

  @Post('/create')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  createCourseFeedback(
    @Body() request: CreateCourseFeedbackRequest,
    @Query('courseId') courseId: string,
    @Req() req: Request,
  ): Promise<void> {
    return this.courseFeedbackService.createCourseFeedback(
      courseId,
      req['user']['id'],
      request,
    );
  }
}
