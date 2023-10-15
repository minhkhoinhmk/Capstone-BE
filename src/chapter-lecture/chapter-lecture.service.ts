import { Injectable, Logger } from '@nestjs/common';
import { ChapterLectureRepository } from './chapter-lecture.repository';
import { ChapterLecture } from './entity/chapter-lecture.entity';

@Injectable()
export class ChapterLectureService {
  private logger = new Logger('ChapterLectureService', { timestamp: true });

  constructor(private chapterLectureRepository: ChapterLectureRepository) {}

  async getChapterLectureByCourseId(
    courseId: string,
  ): Promise<ChapterLecture[]> {
    const chapterLectures =
      await this.chapterLectureRepository.getChapterLectureByUserId(courseId);
    return chapterLectures;
  }
}
