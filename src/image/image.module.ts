import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { S3Module } from 'src/s3/s3.module';
import { ConfigService } from 'aws-sdk';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [S3Module, ConfigModule],
  providers: [ImageService, ConfigService],
  controllers: [ImageController],
})
export class ImageModule {}
