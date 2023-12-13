import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { AuthModule } from 'src/auth/auth.module';
import { S3Module } from 'src/s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from 'aws-sdk';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AuthModule,
    S3Module,
    ConfigModule,
  ],
  providers: [CategoryRepository, CategoryService, ConfigService],
  controllers: [CategoryController],
  exports: [CategoryRepository],
})
export class CategoryModule {}
