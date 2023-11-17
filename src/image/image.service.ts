import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ImageService {
  private logger = new Logger('ImageService', { timestamp: true });

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  async getImage(path: string) {
    try {
      const options = {
        Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
        Key: path,
      };

      const s3Object = await this.s3Service.getObject(options);

      this.logger.log(`method=getImage, path=${path}`);

      return s3Object;
    } catch (error) {
      this.logger.log(`method=getImage, error=${error.message}`);
      throw new NotFoundException(`Image with path ${path} not found`);
    }
  }
}
