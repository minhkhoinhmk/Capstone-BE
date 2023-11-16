import { Module } from '@nestjs/common';
import { CourseReportService } from './course-report.service';
import { CourseReportController } from './course-report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReport } from './entity/course-report.entity';
import { CourseModule } from 'src/course/course.module';
import { UserModule } from 'src/user/user.module';
import { CourseReportRepository } from './course-report.repository';
import { AuthModule } from 'src/auth/auth.module';
import { LearnerModule } from 'src/learner/learner.module';
import { CourseReportMapper } from './mapper/course-report.mapper';

@Module({
  providers: [CourseReportService, CourseReportRepository, CourseReportMapper],
  controllers: [CourseReportController],
  imports: [
    TypeOrmModule.forFeature([CourseReport]),
    CourseModule,
    UserModule,
    AuthModule,
    LearnerModule,
  ],
})
export class CourseReportModule {}
