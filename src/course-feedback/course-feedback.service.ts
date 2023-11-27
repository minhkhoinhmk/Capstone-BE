import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseFeedbackRepository } from './course-feedback.repository';
import { CourseFeedback } from './entity/course-feedbacl.entity';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { CourseFeedbackResponse } from './dto/response/course-feedback-response.dto';
import { NameRole } from 'src/role/enum/name-role.enum';
import { Role } from 'src/role/entity/role.entity';
import { RoleRepository } from 'src/role/role.repository';
import { OrderRepository } from 'src/order/order.repository';
import { LearnerCourseRepository } from 'src/learner-course/learner-course.repository';
import { User } from 'src/user/entity/user.entity';
import { LearnerRepository } from 'src/learner/learner.repository';
import { UserRepository } from 'src/user/user.repository';
import { CreateCourseFeedbackRequest } from './dto/request/create-course-feedback-request.dto';
import { CourseRepository } from 'src/course/course.repository';

@Injectable()
export class CourseFeedbackService {
  private logger = new Logger('CourseFeedbackService', { timestamp: true });

  constructor(
    private courseFeedbackRepository: CourseFeedbackRepository,
    private readonly roleRepository: RoleRepository,
    private readonly orderRepository: OrderRepository,
    private readonly learnerCourseRepository: LearnerCourseRepository,
    private readonly learnerRepository: LearnerRepository,
    private readonly userRepository: UserRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

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
      let role: Role;

      if (feedback.user) {
        role = feedback.user.role;
      } else if (feedback.learner) {
        role = await this.roleRepository.getRoleByName(NameRole.Learner);
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
        role: role,
      });
    }

    return new PageDto(responses, pageMetaDto);
  }

  async createCourseFeedback(
    courseId: string,
    customerId: string,
    request: CreateCourseFeedbackRequest,
  ): Promise<void> {
    let feedback =
      await this.courseFeedbackRepository.checkCourseFeedbackExistedByUser(
        courseId,
        customerId,
      );

    if (feedback === null) {
      feedback =
        await this.courseFeedbackRepository.checkCourseFeedbackExistedByLearner(
          courseId,
          customerId,
        );
    }

    const customer = await this.userRepository.getUserById(customerId);

    const learner = await this.learnerRepository.getLeanerById(customerId);

    const course = await this.courseRepository.getCourseById(courseId);

    if (feedback) {
      throw new ConflictException(
        `Course feedback with courseId ${courseId} and customerId ${customerId} already exists`,
      );
    } else {
      if (customer) {
        if (
          await this.orderRepository.checkOrderExistedByUserAndCourse(
            courseId,
            customer.id,
          )
        ) {
          const courseFeedback =
            await this.courseFeedbackRepository.createCourseFeedback(
              request,
              course,
              learner,
              customer,
            );
          this.courseFeedbackRepository.save(courseFeedback);

          this.logger.log(
            `method=createCourseFeedback, courseId=${courseId}, customerId=${customer.id} created feedback successfully`,
          );
        } else {
          throw new NotFoundException(
            `Customer did not buy course ${course.title}`,
          );
        }
      } else if (learner) {
        if (
          this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
            courseId,
            learner.id,
          )
        ) {
          const courseFeedback =
            await this.courseFeedbackRepository.createCourseFeedback(
              request,
              course,
              learner,
              customer,
            );
          this.courseFeedbackRepository.save(courseFeedback);

          this.logger.log(
            `method=createCourseFeedback, courseId=${courseId}, learnerId=${learner.id} created feedback successfully`,
          );
        } else {
          throw new NotFoundException(
            `Learner did not assign course ${course.title}`,
          );
        }
      }
    }
  }
}
