import {
  BadRequestException,
  Injectable,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import * as rangeParser from 'range-parser';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class VideoService {
  private logger = new Logger('CourseFeedbackService', { timestamp: true });

  constructor(private readonly configService: ConfigService) {}

  async getVideoStreamById() {
    const s3 = new S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });

    var options = {
      Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
      Key: 'test2.mp4',
    };

    var stream = s3.getObject(options).createReadStream();

    // const stream = createReadStream(join(process.cwd(), 'src/test.mp4'));

    return new StreamableFile(stream, {
      disposition: `inline; filename="src/test.mp4"`,
      type: 'video/mp4',
    });
  }

  parseRange(range: string, fileSize: number) {
    const parseResult = rangeParser(fileSize, range);
    if (parseResult === -1 || parseResult === -2 || parseResult.length !== 1) {
      throw new BadRequestException();
    }
    return parseResult[0];
  }

  async getFileSize(path: string) {
    const status = await stat(path);

    return status.size;
  }

  getContentRange(rangeStart: number, rangeEnd: number, fileSize: number) {
    return `bytes ${rangeStart}-${rangeEnd}/${fileSize}`;
  }

  async getPartialVideoStream(range: string) {
    const videoPath = join(process.cwd(), 'src/test.mp4');
    const fileSize = await this.getFileSize(videoPath);

    const { start, end } = this.parseRange(range, fileSize);

    // const stream = createReadStream(videoPath, { start, end });

    const s3 = new S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });

    var options = {
      Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
      Key: 'test2.mp4',
      Range: range,
    };

    var stream = s3.getObject(options).createReadStream();

    const streamableFile = new StreamableFile(stream, {
      disposition: `inline; filename="src/test.mp4"`,
      type: 'video/mp4',
    });

    const contentRange = this.getContentRange(start, end, fileSize);

    return {
      streamableFile,
      contentRange,
    };
  }
}
