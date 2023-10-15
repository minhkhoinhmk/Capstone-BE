import { Injectable, Logger } from '@nestjs/common';
import { CourseFeedbackRepository } from './course-feedback.repository';
import { CourseFeedback } from './entity/course-feedbacl.entity';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { CourseFeedbackResponse } from './dto/response/course-feedback-response.dto';
import { NameRole } from 'src/role/enum/name-role.enum';

@Injectable()
export class CourseFeedbackService {
  private logger = new Logger('CourseFeedbackService', { timestamp: true });

  constructor(private courseFeedbackRepository: CourseFeedbackRepository) {}

  async getCourseFeedbackByCourseId(
    courseId: string,
    pageOption: PageOptionsDto,
  ): Promise<PageDto<CourseFeedbackResponse>> {
    let courseFeedbacks: CourseFeedback[] = [];
    const responses: CourseFeedbackResponse[] = [];

    const { count, entites } =
      await this.courseFeedbackRepository.getCourseFeedbackByCourseId(
        courseId,
        pageOption,
      );

    courseFeedbacks = entites;

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
    });

    for (const feedback of courseFeedbacks) {
      let roles: NameRole[] = [];

      if (feedback.user) {
        feedback.user.roles.forEach((role) => {
          roles.push(role.name);
        });
      } else if (feedback.learner) {
        roles.push(feedback.learner.role.name);
      }

      responses.push({
        id: feedback.id,
        ratedStar: feedback.ratedStar,
        description: feedback.description,
        insertedDate: feedback.insertedDate,
        insertedBy: feedback.insertedBy,
        updatedDate: feedback.updatedDate,
        updatedBy: feedback.updatedBy,
        active: feedback.active,
        role: roles,
      });
    }

    return new PageDto(responses, pageMetaDto);
  }
}
