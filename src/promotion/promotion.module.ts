import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Promotion from './entity/promotion.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PromotionCourseModule } from 'src/promotion-course/promotion-course.module';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PromotionRepository } from './promotion.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion]),
    forwardRef(() => AuthModule),
    forwardRef(() => PromotionCourseModule),
  ],
  providers: [PromotionService, PromotionRepository],
  controllers: [PromotionController],
  exports: [PromotionService, PromotionRepository],
})
export class PromotionModule {}
