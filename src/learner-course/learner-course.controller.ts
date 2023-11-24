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

  @Post('/create')
  @ApiCreatedResponse({
    description: 'Created Learner Course Successfully',
  })
  @ApiConflictResponse({
    description: 'Learner or course were already exists',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  async createLearnerCourse(
    @Body() learnerCourseDto: CreateLearnerCourseRequest,
  ): Promise<void> {
    return this.learnerCourseService.createLearnerCourse(learnerCourseDto);
  }

  @Patch('/update')
  @ApiCreatedResponse({
    description: 'Updated Learner Course Successfully',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  async updateLearnerCourse(
    @Body() body: UpdateLearnerCourseRequest,
    @Req() request: Request,
  ): Promise<void> {
    return this.learnerCourseService.updateLearnerCourse(
      body,
      request['user'] as User,
    );
  }

  @Get('/course/learning/learner/:courseId')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  async getLearnerIsLearningCourse(
    @Param('courseId') courseId: string,
    @Req() request: Request,
  ) {
    return this.learnerCourseService.getLearnerIsLearningCourseByCourseId(
      courseId,
      request['user'] as User,
    );
  }

  // @Get('/course/learning/customer/:courseId')
  // @UseGuards(AuthGuard(), RolesGuard)
  // @HasRoles(NameRole.Customer)
  // async checkCustomerIsLearningCourse(
  //   @Param('courseId') courseId: string,
  //   @Req() request: Request,
  // ) {
  //   return this.learnerCourseService.checkCustomerIsLearningCourseByCourseId(
  //     courseId,
  //     request['user'] as User,
  //   );
  // }
}
