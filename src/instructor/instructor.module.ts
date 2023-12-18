import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { S3Module } from 'src/s3/s3.module';
import { UserModule } from 'src/user/user.module';
import { NotificationModule } from 'src/notification/notification.module';
import { CategoryModule } from 'src/category/category.module';
import { LevelModule } from 'src/level/level.module';
import { CourseModule } from 'src/course/course.module';
import { DeviceModule } from 'src/device/device.module';
import { AuthModule } from 'src/auth/auth.module';
import { CourseMapper } from 'src/course/mapper/course.mapper';
import { InstructorMapper } from './mapper/instructor.mapper';
import { ChapterLectureModule } from 'src/chapter-lecture/chapter-lecture.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PromotionModule } from 'src/promotion/promotion.module';
import { PromotionCourseModule } from 'src/promotion-course/promotion-course.module';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';

@Module({
  providers: [InstructorService, InstructorMapper, ConfigService],
  controllers: [InstructorController],
  imports: [
    S3Module,
    UserModule,
    NotificationModule,
    CategoryModule,
    LevelModule,
    CourseModule,
    DeviceModule,
    AuthModule,
    CourseMapper,
    ChapterLectureModule,
    ConfigModule,
    PromotionModule,
    PromotionCourseModule,
    DynamodbModule,
  ],
})
export class InstructorModule {}
