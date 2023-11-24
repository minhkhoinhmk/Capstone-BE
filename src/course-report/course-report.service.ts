import { Injectable, Logger } from '@nestjs/common';
import { CourseRepository } from 'src/course/course.repository';
import { UserRepository } from 'src/user/user.repository';
import { CourseReportRepository } from './course-report.repository';
import { CreateCourseReportRequest } from './dto/request/create-report.dto';
import { CourseReport } from './entity/course-report.entity';
import { LearnerRepository } from 'src/learner/learner.repository';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { CourseReportResponse } from './dto/response/report-reponse.dto';
import { CourseReportMapper } from './mapper/course-report.mapper';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';

@Injectable()
export class CourseReportService {
  private logger = new Logger('CourseReportService', { timestamp: true });

  constructor(
    private courseRepository: CourseRepository,
    private userRepository: UserRepository,
    private courseReportRepository: CourseReportRepository,
    private learnerRepository: LearnerRepository,
    private courseReportMapper: CourseReportMapper,
  ) {}

  async createCourseReport(
    request: CreateCourseReportRequest,
    userId: string,
    courseId: string,
  ): Promise<CourseReport> {
    const course = await this.courseRepository.getCourseById(courseId);
    const user = await this.userRepository.getUserById(userId);
    const learner = await this.learnerRepository.getLeanerById(userId);

    const report = await this.courseReportRepository.createCourseReport(
      request,
      user,
      course,
      learner,
    );

    this.logger.log(`method=createCourseReport, created successfully`);

    return await this.courseReportRepository.saveCourseReport(report);
  }

  async getCourseReports(): Promise<CourseReportResponse[]> {
    const courseReports: CourseReport[] =
      await this.courseReportRepository.getCourseReports();

    const responses: CourseReportResponse[] = [];

    for (const report of courseReports) {
      if (report.user) {
        responses.push(
          this.courseReportMapper.filterCourseReportResponseFromCourseReportWithUser(
            report,
          ),
        );
      } else {
        responses.push(
          this.courseReportMapper.filterCourseReportResponseFromCourseReportWithLearner(
            report,
          ),
        );
      }
    }

    this.logger.log(`method=getCourseReports, totalItems=${responses.length}`);

    return responses;
  }
}
