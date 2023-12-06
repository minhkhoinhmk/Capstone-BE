import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievement } from './entity/achievement.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { Course } from 'src/course/entity/course.entity';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  async createAchievement(
    customer: User,
    learner: Learner,
    course: Course,
  ): Promise<Achievement> {
    return this.achievementRepository.create({
      path: '',
      insertedDate: dateInVietnam(),
      active: true,
      user: customer,
      learner: learner,
      course: course,
    });
  }

  async save(achievement: Achievement): Promise<Achievement> {
    return await this.achievementRepository.save(achievement);
  }

  async getAchievementByLeaner(learnerId: string): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      where: {
        learner: {
          id: learnerId,
        },
      },
      relations: {
        course: true,
        user: true,
        learner: true,
      },
    });
  }

  async getAchievementByCustomer(customerId: string): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      where: {
        user: {
          id: customerId,
        },
      },
      relations: {
        course: true,
        user: true,
        learner: true,
      },
    });
  }

  async getAchievementByCustomerAndCourse(
    customerId: string,
    courseId: string,
  ): Promise<Achievement> {
    return await this.achievementRepository.findOne({
      where: {
        user: {
          id: customerId,
        },
        course: {
          id: courseId,
        },
      },
      relations: {
        course: true,
        user: true,
        learner: true,
      },
    });
  }

  async getAchievementByLearnerAndCourse(
    learnerId: string,
    courseId: string,
  ): Promise<Achievement> {
    return await this.achievementRepository.findOne({
      where: {
        learner: {
          id: learnerId,
        },
        course: {
          id: courseId,
        },
      },
      relations: {
        course: true,
        user: true,
        learner: true,
      },
    });
  }
}
