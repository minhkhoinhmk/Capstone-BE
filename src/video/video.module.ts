import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Module } from 'src/s3/s3.module';

@Module({
  providers: [VideoService, ConfigService],
  controllers: [VideoController],
  imports: [ConfigModule, S3Module],
})
export class VideoModule {}
