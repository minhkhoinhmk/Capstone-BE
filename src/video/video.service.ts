import {
  BadRequestException,
  Injectable,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { stat } from 'fs/promises';
import { join } from 'path';
import * as rangeParser from 'range-parser';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import { COURSE_PATH } from 'src/common/s3/s3.constants';

@Injectable()
export class VideoService {
  private logger = new Logger('VideoService', { timestamp: true });
  private fileSize: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  async getVideoStream(id: string) {
    var options = {
      Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
      Key: id,
    };

    this.fileSize = (
      await (await this.s3Service.headObject(options)).promise()
    ).ContentLength;

    console.log(`this.fileSize: ${this.fileSize}`);

    var stream = (await this.s3Service.getObject(options)).createReadStream();

    this.logger.log(`method=getVideoStream, stream fully loaded`);

    return new StreamableFile(stream, {
      disposition: `inline; filename="${options.Key}"`,
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

  async getPartialVideoStream(range: string, id: string) {
    var options = {
      Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
      Key: id,
      Range: range,
    };

    const { start, end } = this.parseRange(range, this.fileSize);

    console.log(this.fileSize);

    var stream = (await this.s3Service.getObject(options)).createReadStream();

    const streamableFile = new StreamableFile(stream, {
      disposition: `inline; filename="${options.Key}"`,
      type: 'video/mp4',
    });

    const contentRange = this.getContentRange(start, end, this.fileSize);

    this.logger.log(
      `method=getPartialVideoStream, stream partialy loaded, range=${range}`,
    );

    return {
      streamableFile,
      contentRange,
    };
  }

  async pushToS3(
    buffer: Buffer,
    substringAfterDot: string,
    type: string,
  ): Promise<void> {
    const uuid = uuidv4();

    await this.s3Service.putObject(
      buffer,
      `${COURSE_PATH}${uuid}.${substringAfterDot}`,
      type,
    );
  }
}
