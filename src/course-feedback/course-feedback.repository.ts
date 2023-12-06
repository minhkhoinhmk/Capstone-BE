import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseFeedback } from './entity/course-feedbacl.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { CreateCourseFeedbackRequest } from './dto/request/create-course-feedback-request.dto';
import { Course } from 'src/course/entity/course.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

@Injectable()
export class CourseFeedbackRepository {
  private logger = new Logger('CourseFeedbackRepository', { timestamp: true });

  constructor(
    @InjectRepository(CourseFeedback)
    private courseFeedbackRepository: Repository<CourseFeedback>,
  ) {}

  async getCourseFeedbackByCourseId(
    courseId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ count: number; entites: CourseFeedback[] }> {
    const courseFeedbacks = await this.courseFeedbackRepository.find({
      where: { course: { id: courseId } },
      relations: { user: { role: true }, learner: true },
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      take: pageOptionsDto.take,
    });

    const entites = courseFeedbacks;
    const count = await this.courseFeedbackRepository.count({
      where: { course: { id: courseId } },
    });

    return { count, entites };
  }

  async checkCourseFeedbackExistedByUser(
    courseId: string,
    userId: string,
  ): Promise<CourseFeedback> {
    return this.courseFeedbackRepository.findOne({
      where: {
        course: { id: courseId },
        user: { id: userId },
      },
    });
  }

  async checkCourseFeedbackExistedByLearner(
    courseId: string,
    userId: string,
  ): Promise<CourseFeedback> {
    return this.courseFeedbackRepository.findOne({
      where: {
        course: { id: courseId },
        learner: { id: userId },
      },
    });
  }

  async createCourseFeedback(
    request: CreateCourseFeedbackRequest,
    course: Course,
    learner: Learner,
    user: User,
  ): Promise<CourseFeedback> {
    return this.courseFeedbackRepository.create({
      ratedStar: request.ratedStar,
      description: request.description,
      insertedDate: dateInVietnam(),
      insertedBy: user
        ? `${user.lastName} ${user.middleName} ${user.firstName}`
        : `${learner.lastName} ${learner.middleName} ${learner.firstName}`,
      updatedDate: dateInVietnam(),
      updatedBy: user
        ? `${user.lastName} ${user.middleName} ${user.firstName}`
        : `${learner.lastName} ${learner.middleName} ${learner.firstName}`,
      active: true,
      user: user ? user : null,
      course: course,
      learner: learner ? learner : null,
    });
  }

  async save(courseFeedback: CourseFeedback): Promise<void> {
    await this.courseFeedbackRepository.save(courseFeedback);
  }
}
