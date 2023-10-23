import { Module } from '@nestjs/common';
import { LearnerCourseService } from './learner-course.service';
import { LearnerCourseController } from './learner-course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearnerCourse } from './entity/learner-course.entity';
import { LearnerCourseRepository } from './learner-course.repository';
import { LearnerModule } from 'src/learner/learner.module';
import { CourseModule } from 'src/course/course.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearnerCourse]),
    LearnerModule,
    CourseModule,
    AuthModule,
  ],
  providers: [LearnerCourseService, LearnerCourseRepository],
  controllers: [LearnerCourseController],
})
export class LearnerCourseModule {}
