import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChapterLecture } from './entity/chapter-lecture.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChapterLectureRepository {
  private logger = new Logger('ChapterLectureRepository', { timestamp: true });

  constructor(
    @InjectRepository(ChapterLecture)
    private chapterLectureRepository: Repository<ChapterLecture>,
  ) {}

  async getChapterLectureByUserId(courseId: string): Promise<ChapterLecture[]> {
    const chapterLectures = await this.chapterLectureRepository.find({
      where: { course: { id: courseId } },
    });

    return chapterLectures;
  }
}