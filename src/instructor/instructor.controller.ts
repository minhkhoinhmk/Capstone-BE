import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { Request } from 'express';
import { UpdateCourseRequest } from '../course/dto/request/update-course-request.dto';
import { UpdatePriceCourseRequest } from 'src/course/dto/request/update-price-course-request.dto';
import { UpdateBankRequest } from './dto/request/update-bank-request.dto';
import { ViewInstructorResponse } from './dto/response/view-instructor-response.dto';
import { InstructorStatus } from './enum/instructor-status.enum';
import { SetInstructorStatusRequest } from './dto/request/set-instructor-status-request.dto';
import { UpdateInstructorProfileRequest } from './dto/request/update-profile-request.dto';
import { GetCourseByInstructorRequest } from './dto/request/get-course-by-instructor.request.dto';

@Controller('instructor')
@ApiTags('Intstructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Post('/certifications/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificate(
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

  @Post('/course')
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

  @Patch('/course')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  @ApiCreatedResponse({
    description: 'Update Course Successfully',
    type: Course,
  })
  @ApiBody({
    type: UpdateCourseRequest,
  })
  async UpdateCourseRequest(
    @Req() request: any,
    @Body() body: UpdateCourseRequest,
  ): Promise<Course> {
    return await this.instructorService.updateCourse(
      body,
      request['user']['id'],
    );
  }

  @Patch('/course/price')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  @ApiCreatedResponse({
    description: 'Update Course price Successfully',
    type: Course,
  })
  @ApiBody({
    type: UpdatePriceCourseRequest,
  })
  async UpdatePriceCourse(
    @Req() request: any,
    @Body() body: UpdatePriceCourseRequest,
  ): Promise<Course> {
    return await this.instructorService.updatePriceCourse(
      body,
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

  @Post('/course/own')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  getCoursesByInstructor(
    @Body() body: GetCourseByInstructorRequest,
    @Req() request: Request,
  ): Promise<PageDto<FilterCourseByInstructorResponse>> {
    return this.instructorService.getCoursesByInstructorId(
      request['user']['id'],
      body,
    );
  }

  @Put('/bank/update')
  updateBankForInstructor(
    @Body() request: UpdateBankRequest,
    @Query('email') email: string,
  ): Promise<void> {
    return this.instructorService.updateBankForInstructor(email, request);
  }

  @Get()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  getInstructors(
    @Query('status') status: InstructorStatus,
  ): Promise<ViewInstructorResponse[]> {
    return this.instructorService.getInstructors(status);
  }

  @Get('/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  getInstructorById(@Param('id') id: string): Promise<ViewInstructorResponse> {
    return this.instructorService.getInstructorById(id);
  }

  @Get('/profile/view')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  getInstructorProfile(
    @Req() request: Request,
  ): Promise<ViewInstructorResponse> {
    return this.instructorService.getInstructorById(request['user']['id']);
  }

  @Put('/status/set')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  setInstructorStatus(
    @Body() request: SetInstructorStatusRequest,
  ): Promise<void> {
    return this.instructorService.setInstructorSatus(request);
  }

  @Put('/profile/update')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  updateInstructorProfile(
    @Req() req: Request,
    @Body() request: UpdateInstructorProfileRequest,
  ): Promise<void> {
    return this.instructorService.updateInstructorProfile(
      req['user']['id'],
      request,
    );
  }
}
