import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateLearnerCourseRequest } from './dto/request/create-learner-course.dto';
import { LearnerCourseService } from './learner-course.service';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { UpdateLearnerCourseRequest } from './dto/request/update-learner-course.dto';
import { Request } from 'express';
import { User } from 'src/user/entity/user.entity';

@Controller('learner-course')
@ApiTags('Learner Course')
export class LearnerCourseController {
  constructor(private learnerCourseService: LearnerCourseService) {}

  @ApiCreatedResponse({
    description: 'Created Learner Course Successfully',
  })
  @ApiConflictResponse({
    description: 'Learner or course were already exists',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Post('/create')
  async createLearnerCourse(
    @Body() learnerCourseDto: CreateLearnerCourseRequest,
  ): Promise<void> {
    return this.learnerCourseService.createLearnerCourse(learnerCourseDto);
  }

  @ApiCreatedResponse({
    description: 'Updated Learner Course Successfully',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Patch('/update')
  async updateLearnerCourse(
    @Body() body: UpdateLearnerCourseRequest,
  ): Promise<void> {
    return this.learnerCourseService.updateLearnerCourse(body);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/course/learning/:courseId')
  async getLearnerIsLearningCourse(
    @Param('courseId') courseId: string,
    @Req() request: Request,
  ) {
    return this.learnerCourseService.getLearnerIsLearningCourseByCourseId(
      courseId,
      request['user'] as User,
    );
  }
}
