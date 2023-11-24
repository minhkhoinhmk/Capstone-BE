import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CourseReportService } from './course-report.service';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateCourseReportRequest } from './dto/request/create-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { CourseReport } from './entity/course-report.entity';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { CourseReportResponse } from './dto/response/report-reponse.dto';
import { Request } from 'express';

@Controller('course-report')
@ApiTags('Course Report')
export class CourseReportController {
  constructor(private courseReportService: CourseReportService) {}

  @ApiCreatedResponse({
    description: 'Created Course Report Successfully',
  })
  @ApiBody({
    type: CreateCourseReportRequest,
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  @Post()
  createCourseReport(
    @Query('courseId') courseId: string,
    @Body() createCourseReportRequest: CreateCourseReportRequest,
    @Req() request: Request,
  ): Promise<CourseReport> {
    return this.courseReportService.createCourseReport(
      createCourseReportRequest,
      request['user']['id'],
      courseId,
    );
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  @Get()
  getCourseReports(): Promise<CourseReportResponse[]> {
    return this.courseReportService.getCourseReports();
  }
}
