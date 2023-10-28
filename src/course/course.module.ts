import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entity/course.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { CourseRepository } from './course.repository';
import { AuthModule } from 'src/auth/auth.module';
import { PromotionCourseModule } from 'src/promotion-course/promotion-course.module';
import { OrderModule } from 'src/order/order.module';
import { CourseMapper } from './mapper/course.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    forwardRef(() => AuthModule),
    PromotionCourseModule,
    forwardRef(() => OrderModule),
  ],
  providers: [CourseService, CourseRepository, CourseMapper],
  controllers: [CourseController],
  exports: [CourseRepository, CourseService, CourseMapper],
})
export class CourseModule {}
