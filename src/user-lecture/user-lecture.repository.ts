import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLecture } from './entity/user-lecture.entity';
import { Repository } from 'typeorm';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';
import { ChapterLecture } from 'src/chapter-lecture/entity/chapter-lecture.entity';

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

  async checkChapterLectureIsCompletedForRefund(
    chapterLectureId: string,
    userId: string,
  ): Promise<UserLecture> {
    const userLecture = await this.userLectureRepository.findOne({
      where: {
        chapterLecture: { id: chapterLectureId },
        learner: { user: { id: userId } },
      },
    });

    return userLecture;
  }

  async createCompletedUserLecture(
    learner: Learner,
    user: User,
    chapterLecture: ChapterLecture,
  ): Promise<UserLecture> {
    return await this.userLectureRepository.create({
      isCompleted: true,
      learner: learner,
      user: user,
      chapterLecture: chapterLecture,
    });
  }

  async saveCompletedUserLecture(userLecture: UserLecture): Promise<void> {
    await this.userLectureRepository.save(userLecture);
  }
}
