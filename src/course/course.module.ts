import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entity/course.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { CourseRepository } from './course.repository';
import { AuthModule } from 'src/auth/auth.module';
import { PromotionCourseModule } from 'src/promotion-course/promotion-course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    AuthModule,
    PromotionCourseModule,
  ],
  providers: [CourseService, CourseRepository],
  controllers: [CourseController],
  exports: [CourseRepository, CourseService],
})
export class CourseModule {}
