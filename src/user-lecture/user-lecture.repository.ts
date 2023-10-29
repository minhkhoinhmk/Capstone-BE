import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLecture } from './entity/user-lecture.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserLectureRepository {
  private logger = new Logger('UserLectureRepository', { timestamp: true });

  constructor(
    @InjectRepository(UserLecture)
    private userLectureRepository: Repository<UserLecture>,
  ) {}

  async checkChapterLectureIsCompletedForCustomer(
    chapterLectureId: string,
    customerId: string,
  ): Promise<UserLecture> {
    const userLecture = await this.userLectureRepository.findOne({
      where: {
        chapterLecture: { id: chapterLectureId },
        user: { id: customerId },
      },
    });

    return userLecture;
  }

  async checkChapterLectureIsCompletedForLearner(
    chapterLectureId: string,
    learnerId: string,
  ): Promise<UserLecture> {
    const userLecture = await this.userLectureRepository.findOne({
      where: {
        chapterLecture: { id: chapterLectureId },
        learner: { id: learnerId },
      },
    });

    return userLecture;
  }
}
