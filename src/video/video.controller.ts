import {
  Controller,
  Get,
  Headers,
  Header,
  Res,
  Logger,
  Post,
  UseInterceptors,
  Req,
  UploadedFile,
  Param,
  Query,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('video')
export class VideoController {
  constructor(private readonly videosService: VideoService) {}

  @Get()
  @Header('Accept-Ranges', 'bytes')
  async streamVideo(
    @Headers('range') range: string,
    @Res({ passthrough: true }) response: Response,
    @Query('id') id: string,
  ) {
    if (!range) {
      return this.videosService.getVideoStream(id);
    }
    const { streamableFile, contentRange } =
      await this.videosService.getPartialVideoStream(range, id);

    response.status(206);

    response.set({
      'Content-Range': contentRange,
    });

    return streamableFile;
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @Req() request: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const parts = file.originalname.split('.'); // Split the string by the dot

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      console.log(substringAfterDot);
      await this.videosService.pushToS3(file.buffer, substringAfterDot);
    }
    // await this.videosService.pushToS3(file.buffer);
  }
}
