import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotAcceptableException,
} from '@nestjs/common';
import { CourseRepository } from 'src/course/course.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { LearnerCourseRepository } from './learner-course.repository';
import { CreateLearnerCourseRequest } from './dto/request/create-learner-course.dto';
import { Learner } from 'src/learner/entity/learner.entity';
import { Course } from 'src/course/entity/course.entity';
import { LearnerCourse } from './entity/learner-course.entity';
import { UpdateLearnerCourseRequest } from './dto/request/update-learner-course.dto';
import { User } from 'src/user/entity/user.entity';
import { UserLectureRepository } from 'src/user-lecture/user-lecture.repository';
import { ChapterLectureRepository } from 'src/chapter-lecture/chapter-lecture.repository';

@Injectable()
export class LearnerCourseService {
  private logger = new Logger('LearnerCourseService', { timestamp: true });

  constructor(
    private courseRepository: CourseRepository,
    private learnerRepository: LearnerRepository,
    private learnerCourseRepository: LearnerCourseRepository,
    // private chapterLectureRepository: ChapterLectureRepository,
    private userLectureRepository: UserLectureRepository,
  ) {}

  async createLearnerCourse(
    createLearnerCourseRequest: CreateLearnerCourseRequest,
  ): Promise<void> {
    const learner: Learner = await this.learnerRepository.getLeanerById(
      createLearnerCourseRequest.learnerId,
    );
    const course: Course = await this.courseRepository.getCourseById(
      createLearnerCourseRequest.courseId,
    );

    if (
      !(await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
        course.id,
        learner.id,
      ))
    ) {
      const learnerCourse: LearnerCourse =
        await this.learnerCourseRepository.createLearnerCourse(learner, course);

      await this.learnerCourseRepository.saveLearnerCourse(learnerCourse);

      this.logger.log(
        `method=createLearnerCourse, learnerCourse created successfully`,
      );
    } else {
      this.logger.log(
        `method=createLearnerCourse, learnerCourse with lernerId ${createLearnerCourseRequest.learnerId} and courseId ${createLearnerCourseRequest.courseId} was existed`,
      );

      throw new ConflictException(
        `Learner Course with lernerId ${createLearnerCourseRequest.learnerId} and courseId ${createLearnerCourseRequest.courseId} was existed`,
      );
    }
  }

  async updateLearnerCourse(body: UpdateLearnerCourseRequest, user: User) {
    const { courseId, currentLearnerId, newLearnerId } = body;

    const course: Course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      this.logger.log(
        `method=updateLearnerCourse, courseId ${courseId} is not existed`,
      );

      throw new BadRequestException(`courseId ${courseId} is not existed`);
    }

    // None -> A
    if (!currentLearnerId && newLearnerId) {
      const newLearner = await this.learnerRepository.getLeanerById(
        newLearnerId,
      );

      await this.learnerCourseRepository.saveLearnerCourse(
        await this.learnerCourseRepository.createLearnerCourse(
          newLearner,
          course,
        ),
      );
    }
    // A -> None
    // + A đã học: không assign
    // + A chưa học: Được assign sang None, xóa learner_course trong db
    else if (currentLearnerId && !newLearnerId) {
      const currentLearner = await this.learnerRepository.getLeanerById(
        currentLearnerId,
      );
      const currentLearnerCourse =
        await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          course.id,
          currentLearner.id,
        );

      if (await this.checkLearnerIsLearningCourse(course, currentLearner))
        throw new NotAcceptableException(
          `currentLearner with id=${currentLearnerId} is already learning course id=${courseId}`,
        );
      else
        await this.learnerCourseRepository.removeLearnerCourse(
          currentLearnerCourse,
        );
    }
    // A -> B
    // + A đã học: Không assign
    // + A chưa học: Assign cho B, xóa A
    else if (currentLearnerId && newLearnerId) {
      const currentLearner = await this.learnerRepository.getLeanerById(
        currentLearnerId,
      );
      const currentLearnerCourse =
        await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          course.id,
          currentLearner.id,
        );
      const newLearner = await this.learnerRepository.getLeanerById(
        newLearnerId,
      );

      if (await this.checkLearnerIsLearningCourse(course, currentLearner)) {
        throw new NotAcceptableException(
          `currentLearner with id=${currentLearnerId} is already learning course id=${courseId}`,
        );
      } else {
        await this.learnerCourseRepository.removeLearnerCourse(
          currentLearnerCourse,
        );
        await this.learnerCourseRepository.saveLearnerCourse(
          await this.learnerCourseRepository.createLearnerCourse(
            newLearner,
            course,
          ),
        );
      }
    }
  }

  async checkLearnerIsLearningCourse(course: Course, learner: Learner) {
    let status = false;
    for (let index = 0; index < course.chapterLectures.length; index++) {
      const userLecture =
        await this.userLectureRepository.checkChapterLectureIsCompletedForLearner(
          course.chapterLectures[index].id,
          learner.id,
        );

      if (userLecture) status = true;
    }

    return status;
  }

  async getLearnerIsLearningCourseByCourseId(courseId: string, user: User) {
    let learnerId = '';
    let isLearning = false;
    const learners: Learner[] = await this.learnerRepository.getLearnerByUserId(
      user.id,
    );
    const course: Course = await this.courseRepository.getCourseById(courseId);

    for (let index = 0; index < learners.length; index++) {
      const learnerCourse =
        await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          course.id,
          learners[index].id,
        );
      if (learnerCourse) {
        learnerId = learnerCourse.learner.id;
        if (await this.checkLearnerIsLearningCourse(course, learners[index]))
          isLearning = true;
      }
    }

    return { learnerId, isLearning };
  }
}

// async updateLearnerCourse(body: UpdateLearnerCourseRequest, user: User) {
//   const { courseId, currentLearnerId, newLearnerId } = body;

//   const course: Course = await this.courseRepository.getCourseById(courseId);
//   if (!course) {
//     this.logger.log(
//       `method=updateLearnerCourse, courseId ${courseId} is not existed`,
//     );

//     throw new BadRequestException(`courseId ${courseId} is not existed`);
//   }

//   // None -> A (chưa tạo)
//   // None -> A (đã tạo)
//   if (!currentLearnerId && newLearnerId) {
//     const newLearner = await this.learnerRepository.getLeanerById(
//       newLearnerId,
//     );
//     const newLearnerCourse =
//       await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
//         course,
//         newLearner,
//       );

//     if (!newLearnerCourse)
//       await this.learnerCourseRepository.saveLearnerCourse(
//         await this.learnerCourseRepository.createLearnerCourse(
//           newLearner,
//           course,
//         ),
//       );
//     else await this.changeActiveLearnerCourse(newLearnerCourse, true);
//   }
//   //A(Đã tạo) -> None
//   else if (currentLearnerId && !newLearnerId) {
//     const currentLearner = await this.learnerRepository.getLeanerById(
//       currentLearnerId,
//     );
//     const currentLearnerCourse =
//       await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
//         course,
//         currentLearner,
//       );
//     await this.changeActiveLearnerCourse(currentLearnerCourse, false);
//   }
//   // A(Đã tạo) -> B(Đã tạo) và B(Đã tạo) -> A(Đã tạo)
//   // A(Đã tạo) -> B(Chưa tạo) và B(Đã tạo) -> A(Đã tạo)
//   else if (currentLearnerId && newLearnerId) {
//     const currentLearner = await this.learnerRepository.getLeanerById(
//       currentLearnerId,
//     );
//     const currentLearnerCourse =
//       await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
//         course,
//         currentLearner,
//       );
//     const newLearner = await this.learnerRepository.getLeanerById(
//       newLearnerId,
//     );
//     const newLearnerCourse =
//       await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
//         course,
//         newLearner,
//       );

//     if (newLearnerCourse) {
//       await this.changeActiveLearnerCourse(currentLearnerCourse, false);
//       await this.changeActiveLearnerCourse(newLearnerCourse, true);
//     } else {
//       await this.changeActiveLearnerCourse(currentLearnerCourse, false);
//       await this.learnerCourseRepository.saveLearnerCourse(
//         await this.learnerCourseRepository.createLearnerCourse(
//           newLearner,
//           course,
//         ),
//       );
//     }
//   }
// }

// async checkCustomerIsLearningCourseByCourseId(courseId: string, user: User) {
//   const course: Course = await this.courseRepository.getCourseById(courseId);
//   if (!course) {
//     this.logger.log(
//       `method=checkCustomerIsLearningCourseByCourseId, courseId ${courseId} is not existed`,
//     );

//     throw new BadRequestException(`courseId ${courseId} is not existed`);
//   }

//   let status = false;
//   for (let index = 0; index < course.chapterLectures.length; index++) {
//     const userLecture =
//       await this.userLectureRepository.checkChapterLectureIsCompletedForCustomer(
//         course.chapterLectures[index].id,
//         user.id,
//       );

//     if (userLecture) status = true;
//   }

//   return { status };
// }
// async changeActiveLearnerCourse(
//   learnerCourse: LearnerCourse,
//   active: boolean,
// ) {
//   learnerCourse.active = active;
//   this.learnerCourseRepository.saveLearnerCourse(learnerCourse);
// }
