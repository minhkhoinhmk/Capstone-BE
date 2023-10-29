import { Injectable, Logger } from '@nestjs/common';
import { ChapterLectureRepository } from './chapter-lecture.repository';
import { ChapterLecture } from './entity/chapter-lecture.entity';
import { LearnerChapterResponse } from './dto/response/learner-chapter-reponse.dto';
import { UserLectureRepository } from 'src/user-lecture/user-lecture.repository';
import { ChapterLectureMapper } from './mapper/chapter-lecture.mapper';
import { UserRepository } from 'src/user/user.repository';
import { LearnerRepository } from 'src/learner/learner.repository';

@Injectable()
export class ChapterLectureService {
  private logger = new Logger('ChapterLectureService', { timestamp: true });

  constructor(
    private chapterLectureRepository: ChapterLectureRepository,
    private userLectureRepository: UserLectureRepository,
    private chapterLectureMapper: ChapterLectureMapper,
    private userRepository: UserRepository,
    private learnerRepository: LearnerRepository,
  ) {}

  async getChapterLectureByCourseId(
    courseId: string,
  ): Promise<ChapterLecture[]> {
    const chapterLectures =
      await this.chapterLectureRepository.getChapterLectureByCourseId(courseId);
    return chapterLectures;
  }

  async getChapterLectureByLearnerOrCustomer(
    userId: string,
    courseId: string,
  ): Promise<LearnerChapterResponse[]> {
    const chapterLectures =
      await this.chapterLectureRepository.getChapterLectureByCourseId(courseId);

    let learnerChapterResponse: LearnerChapterResponse[] = [];

    if (await this.learnerRepository.getLeanerById(userId)) {
      for (const chapter of chapterLectures) {
        const isCompleted = await this.checkChapterIsCompletedForLearner(
          chapter.id,
          userId,
        );
        learnerChapterResponse.push(
          this.chapterLectureMapper.LearnerChapterResponseFromChapterLecture(
            chapter,
            isCompleted,
          ),
        );
      }

      this.logger.log(
        `method=getChapterLectureByLearnerOrCustomer, get chapter lecture for learner, total: ${learnerChapterResponse.length}`,
      );
    } else if (await this.userRepository.getUserById(userId)) {
      for (const chapter of chapterLectures) {
        const isCompleted = await this.checkChapterIsCompletedForCustomer(
          chapter.id,
          userId,
        );
        learnerChapterResponse.push(
          this.chapterLectureMapper.LearnerChapterResponseFromChapterLecture(
            chapter,
            isCompleted,
          ),
        );
      }
      this.logger.log(
        `method=getChapterLectureByLearnerOrCustomer, get chapter lecture for customer, total: ${learnerChapterResponse.length}`,
      );
    }

    return learnerChapterResponse;
  }

  async checkChapterIsCompletedForLearner(
    chapterId: string,
    learnerId: string,
  ): Promise<boolean> {
    const userLecture =
      await this.userLectureRepository.checkChapterLectureIsCompletedForLearner(
        chapterId,
        learnerId,
      );

    return userLecture != null ? userLecture.isCompleted : false;
  }

  async checkChapterIsCompletedForCustomer(
    chapterId: string,
    customerId: string,
  ): Promise<boolean> {
    const userLecture =
      await this.userLectureRepository.checkChapterLectureIsCompletedForCustomer(
        chapterId,
        customerId,
      );

    return userLecture != null ? userLecture.isCompleted : false;
  }
}
