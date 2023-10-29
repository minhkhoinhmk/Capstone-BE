import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ChapterLectureRepository } from 'src/chapter-lecture/chapter-lecture.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { UserRepository } from 'src/user/user.repository';
import { CompletedUserLectureRequest } from './dto/request/completed-user-lecture-request.dto';
import { UserLectureRepository } from './user-lecture.repository';

@Injectable()
export class UserLectureService {
  private logger = new Logger('UserLectureService', { timestamp: true });

  constructor(
    private readonly userRepository: UserRepository,
    private readonly learnerRepository: LearnerRepository,
    private readonly chapterLectureRepository: ChapterLectureRepository,
    private readonly userLectureRepository: UserLectureRepository,
  ) {}

  async saveCompletedUserLecture(
    request: CompletedUserLectureRequest,
    userId: string,
  ): Promise<void> {
    const customer = await this.userRepository.getUserById(userId);
    const learner = await this.learnerRepository.getLeanerById(userId);
    const chapterLecture =
      await this.chapterLectureRepository.getChapterLectureById(
        request.chapterLectureId,
      );

    if (
      (await this.userLectureRepository.checkChapterLectureIsCompletedForCustomer(
        request.chapterLectureId,
        userId,
      )) ||
      (await this.userLectureRepository.checkChapterLectureIsCompletedForLearner(
        request.chapterLectureId,
        userId,
      ))
    ) {
      this.logger.log(
        `method=saveCompletedUserLecture, userId=${userId} ans chapterLectureId=${request.chapterLectureId} was existed`,
      );

      throw new ConflictException(
        `User lecture with userId: ${userId} and chapterLectureId: ${request.chapterLectureId}`,
      );
    } else {
      const userLecture =
        await this.userLectureRepository.createCompletedUserLecture(
          learner,
          customer,
          chapterLecture,
        );
      await this.userLectureRepository.saveCompletedUserLecture(userLecture);

      this.logger.log(
        `method=saveCompletedUserLecture, userId=${userId} ans chapterLectureId=${request.chapterLectureId} saved successfully`,
      );
    }
  }
}
