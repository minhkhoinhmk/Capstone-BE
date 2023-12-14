import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Learner } from './entity/learner.entity';
import { LearnerService } from './learner.service';
import { LearnerController } from './learner.controller';
import { RoleModule } from 'src/role/role.module';
import { LearnerRepository } from './learner.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/course/course.module';
import { LearnerCourseModule } from 'src/learner-course/learner-course.module';
import { UserLectureModule } from 'src/user-lecture/user-lecture.module';
import { CourseFeedbackModule } from 'src/course-feedback/course-feedback.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Learner]),
    RoleModule,
    forwardRef(() => AuthModule),
    UserModule,
    CourseModule,
    LearnerCourseModule,
    UserLectureModule,
    CourseFeedbackModule,
  ],
  providers: [LearnerService, LearnerRepository],
  controllers: [LearnerController],
  exports: [LearnerRepository, LearnerService],
})
export class LearnerModule {}
