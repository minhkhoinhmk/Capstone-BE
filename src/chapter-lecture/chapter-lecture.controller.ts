import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ChapterLectureService } from './chapter-lecture.service';
import { ChapterLecture } from './entity/chapter-lecture.entity';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { LearnerChapterResponse } from './dto/response/learner-chapter-reponse.dto';

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
}
