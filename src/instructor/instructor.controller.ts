import {
  Body,
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
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Course } from 'src/course/entity/course.entity';
import { CreateCourseRequest } from 'src/course/dto/request/create-course-request.dto';

@Controller('instructor')
@ApiTags('Intstructor')
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

  @Post('/course/create')
  @ApiCreatedResponse({
    description: 'Create Course Successfully',
    type: Course,
  })
  @ApiBody({
    type: CreateCourseRequest,
  })
  async createCourse(
    @Body() createCourseRequest: CreateCourseRequest,
  ): Promise<Course> {
    return await this.instructorService.createCourse(createCourseRequest);
  }
}
