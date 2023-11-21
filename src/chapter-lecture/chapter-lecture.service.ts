import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ChapterLectureRepository } from './chapter-lecture.repository';
import { ChapterLecture } from './entity/chapter-lecture.entity';
import { LearnerChapterResponse } from './dto/response/learner-chapter-reponse.dto';
import { UserLectureRepository } from 'src/user-lecture/user-lecture.repository';
import { ChapterLectureMapper } from './mapper/chapter-lecture.mapper';
import { UserRepository } from 'src/user/user.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { CreateChapterLectureRequest } from './dto/request/create-chapter-lecture.request.dto';
import { User } from 'src/user/entity/user.entity';
import { CourseRepository } from 'src/course/course.repository';
import { UpdateChapterLectureRequest } from './dto/request/update-chapter-lecture.request.dto';
import { ChangeIndexChapterLectureRequest } from './dto/request/change-index-chapter-lecture.request.dto';
import { CHAPTER_LECTURE_VIDEO_PATH } from 'src/common/s3/s3.constants';
import { S3Service } from 'src/s3/s3.service';
import { VideoService } from 'src/video/video.service';

@Injectable()
export class ChapterLectureService {
  private logger = new Logger('ChapterLectureService', { timestamp: true });

  constructor(
    private chapterLectureRepository: ChapterLectureRepository,
    private userLectureRepository: UserLectureRepository,
    private chapterLectureMapper: ChapterLectureMapper,
    private userRepository: UserRepository,
    private learnerRepository: LearnerRepository,
    private courseRepository: CourseRepository,
    private readonly s3Service: S3Service,
    private videoService: VideoService,
  ) {}

  async getChapterLectureByCourseId(
    courseId: string,
    active: boolean,
  ): Promise<ChapterLecture[]> {
    const chapterLectures =
      await this.chapterLectureRepository.getChapterLectureByCourseId(
        courseId,
        active,
      );
    return chapterLectures;
  }

  async getChapterLectureByLearnerOrCustomer(
    userId: string,
    courseId: string,
  ): Promise<LearnerChapterResponse[]> {
    const chapterLectures =
      await this.chapterLectureRepository.getChapterLectureByCourseId(
        courseId,
        true,
      );

    const learnerChapterResponse: LearnerChapterResponse[] = [];

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

  async createChapterLectureByInstructor(body: CreateChapterLectureRequest) {
    const course = await this.courseRepository.getCourseById(body.courseId);

    if (!course) {
      this.logger.error(
        `method=createChapterLectureByInstructor, courseId=${body.courseId} is not found`,
      );
      throw new BadRequestException(`courseId=${body.courseId} is not found`);
    }

    if (
      await this.chapterLectureRepository.getChapterLectureByIndex(
        body.index,
        course,
      )
    ) {
      this.logger.error(
        `method=createChapterLectureByInstructor, index=${body.index} in courseId=${body.courseId} is existed`,
      );
      throw new BadRequestException(
        `index=${body.index} in courseId=${body.courseId} is existed`,
      );
    }

    const chapterLecture = new ChapterLecture();
    chapterLecture.index = body.index;
    chapterLecture.title = body.title;
    chapterLecture.description = body.description;
    chapterLecture.status = 'published';
    chapterLecture.isPreviewed = false;
    chapterLecture.active = true;
    chapterLecture.course = course;

    return await this.chapterLectureRepository.saveChapterLecture(
      chapterLecture,
    );
  }

  async updateChapterLectureByInstructor({
    chapterLectureId,
    ...bodyUpdate
  }: UpdateChapterLectureRequest) {
    let chapterLecture =
      await this.chapterLectureRepository.getChapterLectureById(
        chapterLectureId,
      );

    if (!chapterLecture) {
      this.logger.error(
        `method=updateChapterLectureByInstructor, chapterLectureId=${chapterLectureId} is not found`,
      );
      throw new BadRequestException(
        `chapterLectureId=${chapterLectureId} is not found`,
      );
    }

    chapterLecture = { ...chapterLecture, ...bodyUpdate };

    return await this.chapterLectureRepository.saveChapterLecture(
      chapterLecture,
    );
  }

  async changeIndexChapterLectureByInstructor(
    body: ChangeIndexChapterLectureRequest,
  ) {
    let listPromises = [];
    body.chapterLectureIds.forEach((id) => {
      listPromises.push(
        this.chapterLectureRepository.getChapterLectureById(id),
      );
    });

    const chapterLectures: ChapterLecture[] = await Promise.all(listPromises);

    listPromises = [];
    chapterLectures.forEach((chapterLecture, index) => {
      chapterLecture.index = index + 1;
      listPromises.push(
        this.chapterLectureRepository.saveChapterLecture(chapterLecture),
      );
    });
    await Promise.all(listPromises);
  }

  async uploadVideo(
    file: Express.Multer.File,
    buffer: Buffer,
    type: string,
    substringAfterDot: string,
    chapterLectureId: string,
  ): Promise<void> {
    try {
      const chapterLecture =
        await this.chapterLectureRepository.getChapterLectureById(
          chapterLectureId,
        );

      if (!chapterLecture) {
        this.logger.error(
          `method=uploadVideo, chapterLectureId=${chapterLectureId} is not found`,
        );
        throw new BadRequestException(
          `chapterLectureId=${chapterLectureId} is not found`,
        );
      }

      const key = `${CHAPTER_LECTURE_VIDEO_PATH}${chapterLectureId}.${substringAfterDot}`;

      chapterLecture.video = key;

      const duration = await this.videoService.getVideoDuration(file);

      chapterLecture.totalContentLength = Math.floor(duration);

      console.log(Math.floor(duration));

      await this.chapterLectureRepository.saveChapterLecture(chapterLecture);

      await this.s3Service.putObject(buffer, key, type);

      this.logger.log(`method=uploadVideo, uploaded video successfully`);
    } catch (error) {
      this.logger.log(`method=uploadVideo, error: ${error.message}`);
    }
  }
}
