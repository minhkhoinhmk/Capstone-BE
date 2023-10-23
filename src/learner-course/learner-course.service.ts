import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CourseRepository } from 'src/course/course.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { LearnerCourseRepository } from './learner-course.repository';
import { CreateLearnerCourseRequest } from './dto/request/create-learner-course.dto';
import { Learner } from 'src/learner/entity/learner.entity';
import { Course } from 'src/course/entity/course.entity';
import { LearnerCourse } from './entity/learner-course.entity';

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
}
