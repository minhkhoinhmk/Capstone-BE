import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
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

@Injectable()
export class LearnerCourseService {
  private logger = new Logger('LearnerCourseService', { timestamp: true });

  constructor(
    private courseRepository: CourseRepository,
    private learnerRepository: LearnerRepository,
    private learnerCourseRepository: LearnerCourseRepository,
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
        course,
        learner,
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

  async updateLearnerCourse(body: UpdateLearnerCourseRequest) {
    const { courseId, currentLearnerId, newLearnerId } = body;

    const course: Course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      this.logger.log(
        `method=updateLearnerCourse, courseId ${courseId} is not existed`,
      );

      throw new BadRequestException(`courseId ${courseId} is not existed`);
    }

    // None -> A (chưa tạo)
    // None -> A (đã tạo)
    if (!currentLearnerId && newLearnerId) {
      const newLearner = await this.learnerRepository.getLeanerById(
        newLearnerId,
      );
      const newLearnerCourse =
        await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          course,
          newLearner,
        );

      if (!newLearnerCourse)
        await this.learnerCourseRepository.saveLearnerCourse(
          await this.learnerCourseRepository.createLearnerCourse(
            newLearner,
            course,
          ),
        );
      else await this.changeActiveLearnerCourse(newLearnerCourse, true);
    }
    //A(Đã tạo) -> None
    else if (currentLearnerId && !newLearnerId) {
      const currentLearner = await this.learnerRepository.getLeanerById(
        currentLearnerId,
      );
      const currentLearnerCourse =
        await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          course,
          currentLearner,
        );
      await this.changeActiveLearnerCourse(currentLearnerCourse, false);
    }
    // A(Đã tạo) -> B(Đã tạo) và B(Đã tạo) -> A(Đã tạo)
    // A(Đã tạo) -> B(Chưa tạo) và B(Đã tạo) -> A(Đã tạo)
    else if (currentLearnerId && newLearnerId) {
      const currentLearner = await this.learnerRepository.getLeanerById(
        currentLearnerId,
      );
      const currentLearnerCourse =
        await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          course,
          currentLearner,
        );
      const newLearner = await this.learnerRepository.getLeanerById(
        newLearnerId,
      );
      const newLearnerCourse =
        await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          course,
          newLearner,
        );

      if (newLearnerCourse) {
        await this.changeActiveLearnerCourse(currentLearnerCourse, false);
        await this.changeActiveLearnerCourse(newLearnerCourse, true);
      } else {
        await this.changeActiveLearnerCourse(currentLearnerCourse, false);
        await this.learnerCourseRepository.saveLearnerCourse(
          await this.learnerCourseRepository.createLearnerCourse(
            newLearner,
            course,
          ),
        );
      }
    }
  }

  async changeActiveLearnerCourse(
    learnerCourse: LearnerCourse,
    active: boolean,
  ) {
    learnerCourse.active = active;
    this.learnerCourseRepository.saveLearnerCourse(learnerCourse);
  }

  async getLearnerIsLearningCourseByCourseId(courseId: string, user: User) {
    const learners: Learner[] = await this.learnerRepository.getLearnerByUserId(
      user.id,
    );
    const course: Course = await this.courseRepository.getCourseById(courseId);
    let learnerId = '';

    const listPromises = [];
    learners.forEach((learner) => {
      listPromises.push(
        this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          course,
          learner,
        ),
      );
    });

    const learnerCourses: LearnerCourse[] = await Promise.all(listPromises);

    learnerCourses.forEach((learnerCourse) => {
      if (learnerCourse?.active) learnerId = learnerCourse.learner.id;
    });

    return { learnerId };
  }
}
