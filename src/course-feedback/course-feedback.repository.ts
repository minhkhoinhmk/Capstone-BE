import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseFeedback } from './entity/course-feedbacl.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';

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
      relations: { user: { roles: true }, learner: { role: true } },
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      take: pageOptionsDto.take,
    });

    const entites = courseFeedbacks;
    const count = await this.courseFeedbackRepository.count({
      where: { course: { id: courseId } },
    });

    return { count, entites };
  }
}
