import { Controller, Get, Headers, Header, Res, Logger } from '@nestjs/common';
import { VideoService } from './video.service';
import { Response } from 'express';

@Controller('video')
export class VideoController {
  constructor(private readonly videosService: VideoService) {}

  // ...

  //   @Get()
  //   streamVideo() {
  //     return this.videosService.getVideoStreamById();
  //   }

  @Get()
  @Header('Accept-Ranges', 'bytes')
  async streamVideo(
    @Headers('range') range: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!range) {
      return this.videosService.getVideoStreamById();
    }
    const { streamableFile, contentRange } =
      await this.videosService.getPartialVideoStream(range);

    response.status(206);

    response.set({
      'Content-Range': contentRange,
    });

    return streamableFile;
  }
}
