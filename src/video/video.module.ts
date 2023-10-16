import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [VideoService, ConfigService],
  controllers: [VideoController],
  imports: [ConfigModule],
})
export class VideoModule {}
