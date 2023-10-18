import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionCourse } from './entity/promotion-course.entity';
import { PromotionCourseRepository } from './promotion-course.repository';
import { RoleModule } from 'src/role/role.module';
import { PromotionCourseController } from './promotion-course.controller';
import { PromotionCourseService } from './promotion-course.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionCourse]), RoleModule],
  controllers: [PromotionCourseController],
  providers: [PromotionCourseRepository, PromotionCourseService],
  exports: [PromotionCourseRepository],
})
export class PromotionCourseModule {}
