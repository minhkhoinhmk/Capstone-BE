import { Module } from '@nestjs/common';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from './entity/refund.entity';
import { UserLectureModule } from 'src/user-lecture/user-lecture.module';
import { OrderDetailModule } from 'src/order-detail/order-detail.module';
import { CourseModule } from 'src/course/course.module';
import { RefundRepository } from './refund.repository';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';
import { DeviceModule } from 'src/device/device.module';
import { RefundMapper } from './mapper/refund.mapper';
import { LearnerCourseModule } from 'src/learner-course/learner-course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Refund]),
    UserLectureModule,
    OrderDetailModule,
    CourseModule,
    AuthModule,
    NotificationModule,
    DeviceModule,
    LearnerCourseModule,
  ],
  providers: [RefundService, RefundRepository, RefundMapper],
  controllers: [RefundController],
  exports: [RefundRepository],
})
export class RefundModule {}
