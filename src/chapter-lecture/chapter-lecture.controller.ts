import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChapterLectureService } from './chapter-lecture.service';
import { ChapterLecture } from './entity/chapter-lecture.entity';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { LearnerChapterResponse } from './dto/response/learner-chapter-reponse.dto';
import { Request } from 'express';
import { CreateChapterLectureRequest } from './dto/request/create-chapter-lecture.request.dto';
import { UpdateChapterLectureRequest } from './dto/request/update-chapter-lecture.request.dto';
import { ChangeIndexChapterLectureRequest } from './dto/request/change-index-chapter-lecture.request.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chapter-lecture')
@ApiTags('Chapter Lecture')
export class ChapterLectureController {
  constructor(private chapterLectureService: ChapterLectureService) {}

  @Get('courses/:id')
  findAll(@Param('id') id: string): Promise<ChapterLecture[]> {
    return this.chapterLectureService.getChapterLectureByCourseId(id);
  }

  @Get('/courses/learner/study')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Learner, NameRole.Customer)
  async getCoursesByUserId(
    @Req() request: Request,
    @Query('courseId') courseId: string,
  ): Promise<LearnerChapterResponse[]> {
    return await this.chapterLectureService.getChapterLectureByLearnerOrCustomer(
      request['user']['id'],
      courseId,
    );
  }

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  @ApiCreatedResponse({
    description: 'Create Chapter-lecture Successfully',
    type: ChapterLecture,
  })
  @ApiBody({
    type: CreateChapterLectureRequest,
  })
  async createChapterLecture(
    @Body() body: CreateChapterLectureRequest,
  ): Promise<ChapterLecture> {
    return await this.chapterLectureService.createChapterLectureByInstructor(
      body,
    );
  }

  @Patch()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiBody({
    type: UpdateChapterLectureRequest,
  })
  async updateChapterLecture(
    @Body() body: UpdateChapterLectureRequest,
  ): Promise<ChapterLecture> {
    return await this.chapterLectureService.updateChapterLectureByInstructor(
      body,
    );
  }

  @Patch('/index/swap')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async changeIndexChapterLecture(
    @Body() body: ChangeIndexChapterLectureRequest,
  ): Promise<void> {
    return await this.chapterLectureService.swapIndexChapterLectureByInstructor(
      body,
    );
  }

  @Post('/video/upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Query('chapterLectureId') chapterLectureId: string,
  ) {
    const parts = file.originalname.split('.');

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      return await this.chapterLectureService.uploadVideo(
        file,
        file.buffer,
        file.mimetype,
        substringAfterDot,
        chapterLectureId,
      );
    }
  }
}
