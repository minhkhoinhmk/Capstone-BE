import { Module, forwardRef } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Module } from 'src/s3/s3.module';
import { ChapterLectureModule } from 'src/chapter-lecture/chapter-lecture.module';

@Module({
  imports: [ConfigModule, S3Module, forwardRef(() => ChapterLectureModule)],
  providers: [VideoService, ConfigService],
  controllers: [VideoController],
  exports: [VideoService],
})
export class VideoModule {}
