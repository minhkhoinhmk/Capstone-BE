import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionCourse } from './entity/promotion-course.entity';
import { PromotionCourseRepository } from './promotion-course.repository';
import { RoleModule } from 'src/role/role.module';
import { PromotionCourseController } from './promotion-course.controller';
import { PromotionCourseService } from './promotion-course.service';
import { PromotionModule } from 'src/promotion/promotion.module';
import { CourseModule } from 'src/course/course.module';
import { AuthModule } from 'src/auth/auth.module';
import { WinnerModule } from 'src/winner/winner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromotionCourse]),
    forwardRef(() => PromotionModule),
    forwardRef(() => AuthModule),
    forwardRef(() => CourseModule),
    RoleModule,
  ],
  controllers: [PromotionCourseController],
  providers: [PromotionCourseRepository, PromotionCourseService],
  exports: [PromotionCourseRepository, PromotionCourseService],
})
export class PromotionCourseModule {}
