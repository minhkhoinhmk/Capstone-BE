import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { S3Module } from 'src/s3/s3.module';
import { UserModule } from 'src/user/user.module';
import { NotificationModule } from 'src/notification/notification.module';
import { CategoryModule } from 'src/category/category.module';
import { LevelModule } from 'src/level/level.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  providers: [InstructorService],
  controllers: [InstructorController],
  imports: [
    S3Module,
    UserModule,
    NotificationModule,
    CategoryModule,
    LevelModule,
    CourseModule,
  ],
})
export class InstructorModule {}
