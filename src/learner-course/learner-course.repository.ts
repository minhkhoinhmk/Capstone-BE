import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LearnerCourse } from './entity/learner-course.entity';
import { Repository } from 'typeorm';
import { Learner } from 'src/learner/entity/learner.entity';
import { Course } from 'src/course/entity/course.entity';

@Injectable()
export class LearnerCourseRepository {
  constructor(
    @InjectRepository(LearnerCourse)
    private learnerCourseRepository: Repository<LearnerCourse>,
  ) {}

  async createLearnerCourse(
    learner: Learner,
    course: Course,
  ): Promise<LearnerCourse> {
    return this.learnerCourseRepository.create({
      learner: learner,
      course: course,
      active: true,
    });
  }

  async saveLearnerCourse(learnerCourse: LearnerCourse): Promise<void> {
    await this.learnerCourseRepository.save(learnerCourse);
  }

  async getLearnerCourseByCourseAndLearner(
    course: Course,
    learner: Learner,
  ): Promise<LearnerCourse> {
    return await this.learnerCourseRepository.findOne({
      where: { course: course, learner: learner },
    });
  }
}
