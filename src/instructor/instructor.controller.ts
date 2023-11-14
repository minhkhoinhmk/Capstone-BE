import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadStatus } from 'src/s3/dto/upload-status.dto';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Course } from 'src/course/entity/course.entity';
import { CreateCourseRequest } from 'src/course/dto/request/create-course-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { FilterCourseByInstructorResponse } from 'src/course/dto/reponse/filter-by-instructor.dto';

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
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  @ApiCreatedResponse({
    description: 'Create Course Successfully',
    type: Course,
  })
  @ApiBody({
    type: CreateCourseRequest,
  })
  async createCourse(
    @Req() request: any,
    @Body() createCourseRequest: CreateCourseRequest,
  ): Promise<Course> {
    return await this.instructorService.createCourse(
      createCourseRequest,
      request['user']['id'],
    );
  }

  @Post('/course/thumbnail/upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,
  ) {
    const parts = file.originalname.split('.');

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      return await this.instructorService.uploadThumbnail(
        file.buffer,
        file.mimetype,
        substringAfterDot,
        courseId,
      );
    }
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  @Post('/course/own')
  getRefundsByCsutomerId(
    @Body() pageOption: PageOptionsDto,
    @Req() request: Request,
  ): Promise<PageDto<FilterCourseByInstructorResponse>> {
    return this.instructorService.getCoursesByInstructorId(
      request['user']['id'],
      pageOption,
    );
  }
}
