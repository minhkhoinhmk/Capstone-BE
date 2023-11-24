import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseReport } from './entity/course-report.entity';
import { Repository } from 'typeorm';
import { CreateCourseReportRequest } from './dto/request/create-report.dto';
import { User } from 'src/user/entity/user.entity';
import { Course } from 'src/course/entity/course.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';

@Injectable()
export class CourseReportRepository {
  constructor(
    @InjectRepository(CourseReport)
    private courseReportRepository: Repository<CourseReport>,
  ) {}

  async createCourseReport(
    createCourseReportRequest: CreateCourseReportRequest,
    user: User,
    course: Course,
    learner: Learner,
  ): Promise<CourseReport> {
    return this.courseReportRepository.create({
      description: createCourseReportRequest.description,
      active: true,
      course: course,
      user: user,
      learner: learner,
    });
  }

  async saveCourseReport(courseReport: CourseReport): Promise<CourseReport> {
    return this.courseReportRepository.save(courseReport);
  }

  async getCourseReports() {
    const entities = await this.courseReportRepository.find({
      relations: {
        user: true,
        learner: true,
        course: true,
      },
      // skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      // take: pageOptionsDto.take,
    });

    // const count = await this.courseReportRepository.count();

    // return { count: count, entities: entities };
    return entities;
  }
}
