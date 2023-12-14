import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseFeedback } from './entity/course-feedbacl.entity';
import { CourseFeedbackController } from './course-feedback.controller';
import { CourseFeedbackService } from './course-feedback.service';
import { CourseFeedbackRepository } from './course-feedback.repository';
import { RoleModule } from 'src/role/role.module';
import { LearnerCourseModule } from 'src/learner-course/learner-course.module';
import { OrderModule } from 'src/order/order.module';
import { LearnerModule } from 'src/learner/learner.module';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/course/course.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([CourseFeedback]),
    RoleModule,
    LearnerCourseModule,
    OrderModule,
    UserModule,
    forwardRef(() => CourseModule),
    forwardRef(() => LearnerModule),
  ],
  controllers: [CourseFeedbackController],
  providers: [CourseFeedbackService, CourseFeedbackRepository],
  exports: [CourseFeedbackRepository],
})
export class CourseFeedbackModule {}
