import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LearnerCourse } from './entity/learner-course.entity';
import { ILike, Like, Repository } from 'typeorm';
import { Learner } from 'src/learner/entity/learner.entity';
import { Course } from 'src/course/entity/course.entity';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';

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
    courseId: string,
    learnerId: string,
  ): Promise<LearnerCourse> {
    return await this.learnerCourseRepository.findOne({
      where: {
        course: { id: courseId },
        learner: { id: learnerId },
        active: true,
      },
      relations: { course: true, learner: true },
    });
  }

  async getLearnerCourseByCourseAndCustomer(
    courseId: string,
    customerId: string,
  ): Promise<LearnerCourse> {
    return await this.learnerCourseRepository.findOne({
      where: {
        course: { id: courseId },
        learner: { user: { id: customerId } },
      },
      relations: { course: true, learner: true },
    });
  }

  async getCourseByLearnerId(
    search: string,
    learnerId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ count: number; entites: LearnerCourse[] }> {
    let entities: LearnerCourse[] = [];
    let count: number;

    if (search) {
      entities = await this.learnerCourseRepository.find({
        where: {
          learner: { id: learnerId, active: true },
          course: { title: ILike(`%${search}%`) },
        },
        relations: { learner: true, course: true },
        skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
        take: pageOptionsDto.take,
      });

      count = await this.learnerCourseRepository.count({
        where: { learner: { id: learnerId } },
      });
    } else {
      entities = await this.learnerCourseRepository.find({
        where: { learner: { id: learnerId }, active: true },
        relations: { learner: true, course: true },
        skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
        take: pageOptionsDto.take,
      });

      count = await this.learnerCourseRepository.count({
        where: { learner: { id: learnerId } },
      });
    }

    return { count: count, entites: entities };
  }

  async removeLearnerCourse(learnerCourse: LearnerCourse) {
    return this.learnerCourseRepository.remove(learnerCourse);
  }
}
