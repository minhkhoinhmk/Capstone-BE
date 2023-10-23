import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
}
