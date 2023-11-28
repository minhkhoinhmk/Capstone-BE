import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChapterLecture } from './entity/chapter-lecture.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/course/entity/course.entity';

@Injectable()
export class ChapterLectureRepository {
  private logger = new Logger('ChapterLectureRepository', { timestamp: true });

  constructor(
    @InjectRepository(ChapterLecture)
    private chapterLectureRepository: Repository<ChapterLecture>,
  ) {}

  async getChapterLectureByCourseId(
    courseId: string,
    active: boolean,
  ): Promise<ChapterLecture[]> {
    const chapterLectures = await this.chapterLectureRepository.find({
      where: { course: { id: courseId }, active },
    });

    return chapterLectures;
  }

  async getChapterLectureByVideo(video: string): Promise<ChapterLecture> {
    const chapterLecture = await this.chapterLectureRepository.findOne({
      where: { video },
    });

    return chapterLecture;
  }

  async getChapterLectureById(
    chapterLectureId: string,
  ): Promise<ChapterLecture> {
    const chapterLecture = await this.chapterLectureRepository.findOne({
      where: { id: chapterLectureId },
      relations: {
        course: {
          chapterLectures: true,
        },
      },
    });

    return chapterLecture;
  }

  async saveChapterLecture(chapterLecture: ChapterLecture) {
    return this.chapterLectureRepository.save(chapterLecture);
  }

  async getChapterLectureByIndex(index: number, course: Course) {
    return this.chapterLectureRepository.findOne({
      where: {
        index,
        course,
      },
    });
  }
}
