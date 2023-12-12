import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  private logger = new Logger('S3Service', { timestamp: true });

  constructor(private readonly configService: ConfigService) {}

  s3Connection(): S3 {
    return new S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });
  }

  async getObject(options: any) {
    const s3 = this.s3Connection();
    return s3.getObject(options);
  }

  async deleteObject(options: any) {
    console.log(options);
    const s3 = this.s3Connection();
    return s3.deleteObject(options);
  }

  async headObject(options: any) {
    const s3 = this.s3Connection();
    return s3.headObject(options);
  }

  async putObject(dataBuffer: Buffer, key: string, type: string) {
    const s3 = this.s3Connection();
    const result = await s3
      .upload({
        ACL: 'public-read',
        Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: key,
        ContentDisposition: 'inline',
        ContentType: type,
      })
      .promise();
  }
}
