import { Controller, Get, Query, Res } from '@nestjs/common';
import { ImageService } from './image.service';
import { Response } from 'express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  async serveImage(@Query('path') path: string, @Res() res: Response) {
    const image = await this.imageService.getImage(path);

    const response = await image.promise();

    res.setHeader('Content-Type', response.ContentType);

    res.send(response.Body);
  }
}
