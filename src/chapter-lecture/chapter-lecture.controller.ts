import { Controller, Get, Param } from '@nestjs/common';
import { ChapterLectureService } from './chapter-lecture.service';
import { ChapterLecture } from './entity/chapter-lecture.entity';

@Controller('chapter-lecture')
export class ChapterLectureController {
  constructor(private chapterLectureService: ChapterLectureService) {}

  @Get('courses/:id')
  findAll(@Param('id') id: string): Promise<ChapterLecture[]> {
    return this.chapterLectureService.getChapterLectureByCourseId(id);
  }
}
