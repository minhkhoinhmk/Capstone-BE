import {
  Controller,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadStatus } from 'src/s3/dto/upload-status.dto';

@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Post('/certifications/upload')
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @Req() request: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('email') email: string,
  ): Promise<UploadStatus> {
    const parts = file.originalname.split('.');

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      return await this.instructorService.uploadCertification(
        file.buffer,
        substringAfterDot,
        email,
        file.mimetype,
      );
    }
  }
}
