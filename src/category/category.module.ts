import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), AuthModule],
  providers: [CategoryRepository, CategoryService],
  controllers: [CategoryController],
  exports: [CategoryRepository],
})
export class CategoryModule {}
