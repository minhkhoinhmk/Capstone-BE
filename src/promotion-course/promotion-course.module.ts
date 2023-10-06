import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionCourse } from './entity/promotion-course.entity';

@Module({ imports: [TypeOrmModule.forFeature([PromotionCourse])] })
export class PromotionCourseModule {}
