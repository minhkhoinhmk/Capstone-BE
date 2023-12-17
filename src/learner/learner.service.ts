import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateLearnerRequest } from './dto/request/create-learner.dto';
import { RoleRepository } from 'src/role/role.repository';
import { NameRole } from 'src/role/enum/name-role.enum';
import { LearnerRepository } from './learner.repository';
import { UserRepository } from 'src/user/user.repository';
import { FilterLearnerByUserResponse } from './dto/response/filter-by-user.dto';
import { LearnerCourseRepository } from 'src/learner-course/learner-course.repository';
import { CourseMapper } from 'src/course/mapper/course.mapper';
import { CourseRepository } from 'src/course/course.repository';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { UserLectureRepository } from 'src/user-lecture/user-lecture.repository';
import { FilterCourseByLearnerResponse } from 'src/course/dto/reponse/filter-by-learner.dto';
import { UpdateLearnerRequest } from './dto/request/update-learner.dto';
import { ChangePasswordLearnerRequest } from './dto/request/change-password-learner.request.dto';
import * as bcrypt from 'bcrypt';
import { hashPassword } from 'src/utils/hash-password.util';
import { CourseFeedbackRepository } from 'src/course-feedback/course-feedback.repository';
import { CourseLearnStatus } from 'src/course/type/enum/CourseLearnStatus';

@Injectable()
export class LearnerService {
  private logger = new Logger('LearnerService', { timestamp: true });

  constructor(
    private learnerRepository: LearnerRepository,
    private roleRepository: RoleRepository,
    private userRepository: UserRepository,
    private learnerCourseRepository: LearnerCourseRepository,
    private courserMapper: CourseMapper,
    private courseRepository: CourseRepository,
    private userLectureRepository: UserLectureRepository,
    private courseFeedbackRepository: CourseFeedbackRepository,
  ) {}

  async createLearner(
    createLearnerRequest: CreateLearnerRequest,
    id: string,
  ): Promise<void> {
    if (await this.checkUsernameIsExist(createLearnerRequest.userName)) {
      this.logger.error(
        `method=createLearner, userName=${createLearnerRequest.userName} was existed`,
      );
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    } else {
      const customer = await this.userRepository.getUserById(id);

      const role = await this.roleRepository.getRoleByName(NameRole.Learner);

      const learner = await this.learnerRepository.cretaeLearner(
        createLearnerRequest,
        customer,
        role,
      );

      this.logger.log(`method=createLearner, create learner successfully!`);

      if (
        (await this.learnerRepository.countLearnerOfEachCustomer(customer)) >= 3
      ) {
        this.logger.error(`method=createLearner, learner accounts are full`);
        throw new BadRequestException(`Learner accounts are full`);
      } else {
        await this.learnerRepository.saveLearner(learner);
      }
    }
  }

  async updateLearner(body: UpdateLearnerRequest, id: string): Promise<void> {
    const learner = await this.learnerRepository.getLeanerById(body.learnerId);

    if (!learner) {
      this.logger.error(
        `method=updateLearner, learner with id ${id} not found`,
      );
      throw new NotFoundException(`Learner with id ${id} not found`);
    }

    if (await this.checkUsernameIsExist(body.userName)) {
      this.logger.error(
        `method=updateLearner, userName=${body.userName} was existed`,
      );
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    learner.firstName = body.firstName;
    learner.lastName = body.lastName;
    learner.middleName = body.middleName;
    learner.userName = body.userName;

    await this.learnerRepository.saveLearner(learner);
  }

  async changePasswordLearner(body: ChangePasswordLearnerRequest) {
    const { newPassword, learnerId } = body;

    const learner = await this.learnerRepository.getLeanerById(body.learnerId);

    if (!learner) {
      this.logger.error(
        `method=updateLearner, learner with id ${learnerId} not found`,
      );
      throw new NotFoundException(`Learner with id ${learnerId} not found`);
    }

    const hashNewPassword = await hashPassword(newPassword);

    learner.password = hashNewPassword;
    await this.learnerRepository.saveLearner(learner);
  }

  async getLearnerByUserId(
    userId: string,
  ): Promise<FilterLearnerByUserResponse[]> {
    const learners = await this.learnerRepository.getLearnerByUserId(userId);
    const responses: FilterLearnerByUserResponse[] = [];

    for (const learner of learners) {
      responses.push({
        id: learner.id,
        firstName: learner.firstName,
        middleName: learner.middleName,
        lastName: learner.lastName,
        active: learner.active,
        userName: learner.userName,
      });
    }

    this.logger.log(
      `method=getLearnerByUserId, userId=${userId}, length=${responses.length}`,
    );

    return responses;
  }

  async getCoursesForLearner(
    search: string,
    status: CourseLearnStatus,
    userId: string,
    pageOption: PageOptionsDto,
  ): Promise<PageDto<FilterCourseByLearnerResponse>> {
    const { count, entites } =
      await this.learnerCourseRepository.getCourseByLearnerId(
        search,
        userId,
        pageOption,
      );
    let responses: FilterCourseByLearnerResponse[] = [];
    let completedCount = 0;

    for (const leanerCourse of entites) {
      const course = await this.courseRepository.getCourseById(
        leanerCourse.course.id,
      );
      let isCertified = false;
      let isFeedback = false;

      const courseFeedback =
        await this.courseFeedbackRepository.checkCourseFeedbackExistedByLearner(
          leanerCourse.course.id,
          userId,
        );
      if (courseFeedback) isFeedback = true;

      for (const achievement of course.achievements) {
        if (achievement?.learner?.id === userId) {
          isCertified = true;
        }
      }

      for (const chapter of course.chapterLectures) {
        if (
          await this.userLectureRepository.checkChapterLectureIsCompletedForLearner(
            chapter.id,
            userId,
          )
        ) {
          completedCount++;
        }
      }

      responses.push(
        this.courserMapper.filterCourseByLearnerResponseFromCourse(
          course,
          Math.floor((completedCount / course.chapterLectures.length) * 100),
          isCertified,
          isFeedback ? courseFeedback.ratedStar : null,
          isFeedback ? courseFeedback.description : null,
        ),
      );

      completedCount = 0;
    }

    if (status === CourseLearnStatus.COMPLETED)
      responses = responses.filter(
        (courseLearn) => courseLearn.completedPercent === 100,
      );
    else if (status === CourseLearnStatus.LEARNING)
      responses = responses.filter(
        (courseLearn) =>
          courseLearn.completedPercent < 100 &&
          courseLearn.completedPercent > 0,
      );
    else if (status === CourseLearnStatus.NOT_LEARNING)
      responses = responses.filter((courseLearn) => {
        return courseLearn.completedPercent === 0;
      });

    // const itemCount = count;
    const itemCount = responses.length;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
    });

    this.logger.log(`method=getCoursesForLearner, totalItems=${itemCount}`);

    return new PageDto(responses, pageMetaDto);
  }

  async getCoursesForLearnerByLearnerId(
    search: string,
    userId: string,
    pageOption: PageOptionsDto,
  ): Promise<PageDto<FilterCourseByLearnerResponse>> {
    const { count, entites } =
      await this.learnerCourseRepository.getCourseByLearnerId(
        search,
        userId,
        pageOption,
      );
    const responses: FilterCourseByLearnerResponse[] = [];
    let completedCount = 0;

    for (const leanerCourse of entites) {
      const course = await this.courseRepository.getCourseById(
        leanerCourse.course.id,
      );
      let isCertified = false;
      let isFeedback = false;

      const courseFeedback =
        await this.courseFeedbackRepository.checkCourseFeedbackExistedByLearner(
          leanerCourse.course.id,
          userId,
        );
      if (courseFeedback) isFeedback = true;

      for (const achievement of course.achievements) {
        if (achievement?.learner?.id === userId) {
          isCertified = true;
        }
      }

      for (const chapter of course.chapterLectures) {
        if (
          await this.userLectureRepository.checkChapterLectureIsCompletedForLearner(
            chapter.id,
            userId,
          )
        ) {
          completedCount++;
        }
      }

      responses.push(
        this.courserMapper.filterCourseByLearnerResponseFromCourse(
          course,
          Math.floor((completedCount / course.chapterLectures.length) * 100),
          isCertified,
          isFeedback ? courseFeedback.ratedStar : null,
          isFeedback ? courseFeedback.description : null,
        ),
      );

      completedCount = 0;
    }

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
    });

    this.logger.log(`method=getCoursesForLearner, totalItems=${count}`);

    return new PageDto(responses, pageMetaDto);
  }

  async checkUsernameIsExist(userName: string) {
    const isExist = Boolean(
      (await this.userRepository.getUserByUserName(userName)) ||
        (await this.learnerRepository.getLearnerByUserName(userName)),
    );
    return isExist;
  }
}
