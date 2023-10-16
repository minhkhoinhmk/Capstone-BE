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

@Injectable()
export class VideoService {
  private logger = new Logger('CourseFeedbackService', { timestamp: true });

  async getVideoStreamById() {
    const stream = createReadStream(join(process.cwd(), 'src/test.mp4'));

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

    const stream = createReadStream(videoPath, { start, end });

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
