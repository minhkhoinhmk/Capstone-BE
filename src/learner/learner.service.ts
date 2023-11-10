import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
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
import { FilterCourseByCustomerResponse } from 'src/course/dto/reponse/filter-by-customer.dto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { UserLectureRepository } from 'src/user-lecture/user-lecture.repository';
import { response } from 'express';
import { FilterCourseByLearnerResponse } from 'src/course/dto/reponse/filter-by-learner.dto';

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
  ) {}

  async createLearner(
    createLearnerRequest: CreateLearnerRequest,
    id: string,
  ): Promise<void> {
    if (await this.checkUsernameIsExist(createLearnerRequest.userName)) {
      this.logger.error(
        `method=createLearner, userName=${createLearnerRequest.userName} was existed`,
      );
      throw new ConflictException('User name already exists');
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
