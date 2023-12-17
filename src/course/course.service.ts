import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { Course } from './entity/course.entity';
import { SearchCourseReponse } from './dto/reponse/search-course-response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { SearchCourseRequest } from './dto/request/search-course-request.dto';
import { CourseDetailResponse } from './dto/reponse/course-detail-response.dto';
import { NameRole } from 'src/role/enum/name-role.enum';
import { OrderRepository } from 'src/order/order.repository';
import { FilterCourseByCustomerResponse } from './dto/reponse/filter-by-customer.dto';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import { CourseMapper } from './mapper/course.mapper';
import { User } from 'src/user/entity/user.entity';
import { CourseStatus } from './type/enum/CourseStatus';
import { SetStatusRequest } from './dto/request/set-status-request.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as cheerio from 'cheerio';
import { UserLectureRepository } from 'src/user-lecture/user-lecture.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { UserRepository } from 'src/user/user.repository';
import { LearnerCourseRepository } from 'src/learner-course/learner-course.repository';
import { CourseLearnStatus } from './type/enum/CourseLearnStatus';
import { CourseFeedbackRepository } from 'src/course-feedback/course-feedback.repository';

@Injectable()
export class CourseService {
  private logger = new Logger('CourseService', { timestamp: true });

  constructor(
    private courseRepository: CourseRepository,
    private orderRepository: OrderRepository,
    private courserMapper: CourseMapper,
    private mailsService: MailerService,
    private userLectureRepository: UserLectureRepository,
    private learnerCourseRepository: LearnerCourseRepository,
    private courseFeedbackRepository: CourseFeedbackRepository,
  ) {}

  async searchAndFilter(
    searchCourseRequest: SearchCourseRequest,
  ): Promise<PageDto<SearchCourseReponse>> {
    let courses: Course[] = [];
    const responses: SearchCourseReponse[] = [];
    const { pageOptions, ...searchCriteria } = searchCourseRequest;

    const { count, entites } = await this.courseRepository.filter(
      searchCriteria,
      pageOptions,
    );

    courses = entites;

    for (const course of courses) {
      responses.push(this.configCourseResponse(course));
    }

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchCourseRequest.pageOptions,
    });

    this.logger.log(
      `method=searchAndFilter, totalItem=${pageMetaDto.itemCount}`,
    );

    return new PageDto(responses, pageMetaDto);
  }

  async getDetail(courseId: string): Promise<CourseDetailResponse> {
    try {
      const course = await this.courseRepository.getCourseDetailById(courseId);

      const totalLength = this.sumTotalLength(course)
        ? this.sumTotalLength(course)
        : 0;
      const ratedStar = this.countRatedStar(course)
        ? this.countRatedStar(course)
        : 0;
      // const { sumDiscount, promotionCourseByStaffId } =
      //   this.getDiscountOfStaff(course);
      // const discountPrice = course.price - course.price * (sumDiscount / 100);

      const response = {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        // discount: sumDiscount,
        // discountPrice: discountPrice,
        // promotionCourseByStaffId,
        ratedStar: ratedStar,
        authorId: course.user.id,
        author: `${course.user.firstName} ${course.user.middleName} ${course.user.lastName}`,
        categoryId: course.category.id,
        category: course.category.name,
        totalLength: totalLength,
        shortDescription: course.shortDescription,
        prepareMaterial: course.prepareMaterial,
        status: course.status,
        totalChapter: course.totalChapter,
        publishedDate: course.publishedDate,
        totalBought: course.totalBought,
        thumbnailUrl: course.thumbnailUrl,
        active: course.active,
        level: course.level.name,
      };

      return response;
    } catch (error) {
      throw new NotFoundException(`Course with id: ${courseId} was banned`);
    }
  }

  async getCourseById(courseId: string): Promise<Course> {
    return await this.courseRepository.getCourseById(courseId);
  }

  countRatedStar(course: Course): number {
    const allRatedStar = course.courseFeedbacks.reduce(
      (accumulator, currentValue) => {
        return { ratedStar: accumulator.ratedStar + currentValue.ratedStar };
      },
      { ratedStar: 0 },
    );
    return Math.ceil(allRatedStar.ratedStar / course.courseFeedbacks.length);
  }

  sumTotalLength(course: Course): number {
    const totalLength = course.chapterLectures.reduce(
      (accumulator, currentValue) => {
        return {
          totalLength:
            accumulator.totalLength + currentValue.totalContentLength,
        };
      },
      { totalLength: 0 },
    );
    return totalLength.totalLength;
  }

  // getDiscountOfStaff(course: Course): {
  //   sumDiscount: number;
  //   promotionCourseByStaffId: string | null;
  // } {
  //   let sumDiscount = 0;
  //   let promotionCourseByStaffId = null;
  //   const currentDate = new Date();

  //   course.promotionCourses.forEach((promotionCourse) => {
  //     const isStaff =
  //       promotionCourse.promotion.user.role.name === NameRole.Staff;
  //     if (
  //       currentDate <= promotionCourse.promotion.expiredDate &&
  //       currentDate >= promotionCourse.promotion.effectiveDate &&
  //       promotionCourse.active &&
  //       promotionCourse.promotion.active &&
  //       isStaff
  //     ) {
  //       sumDiscount = sumDiscount + promotionCourse.promotion.discountPercent;
  //       promotionCourseByStaffId = promotionCourse.id;
  //     }
  //   });

  //   return { promotionCourseByStaffId, sumDiscount };
  // }

  configCourseResponse(course: Course): SearchCourseReponse {
    const totalLength = this.sumTotalLength(course)
      ? this.sumTotalLength(course)
      : 0;
    const ratedStar = this.countRatedStar(course)
      ? this.countRatedStar(course)
      : 0;
    // const { sumDiscount, promotionCourseByStaffId } =
    //   this.getDiscountOfStaff(course);
    // const discountPrice = course.price - course.price * (sumDiscount / 100);

    const courseResponse: SearchCourseReponse = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,

      // discount: sumDiscount,
      // discountPrice: discountPrice,
      // promotionCourseByStaffId,
      ratedStar: ratedStar,
      author: `${course.user.firstName} ${course.user.middleName} ${course.user.lastName}`, ///
      totalLength: totalLength,
      shortDescription: course.shortDescription,
      prepareMaterial: course.prepareMaterial,
      status: course.status,
      totalChapter: course.totalChapter,
      publishedDate: course.publishedDate,
      totalBought: course.totalBought,
      thumbnailUrl: course.thumbnailUrl,
      active: course.active,
      level: course.level.name,
    };

    return courseResponse;
  }

  async getCoursesByUserId(
    userId: string,
    status: CourseLearnStatus,
  ): Promise<FilterCourseByCustomerResponse[]> {
    const orders = await this.orderRepository.getCoursesByUserId(userId);
    const response: FilterCourseByCustomerResponse[] = [];
    let completedCount = 0;

    for (const order of orders) {
      const courseIds = this.getCourseId(order.orderDetails);

      for (const courseId of courseIds) {
        const course = await this.courseRepository.getCourseById(courseId);
        let isCertified = false;
        let isFeedback = false;

        const courseFeedback =
          await this.courseFeedbackRepository.checkCourseFeedbackExistedByUser(
            courseId,
            userId,
          );
        if (courseFeedback) isFeedback = true;

        for (const achievement of course.achievements) {
          if (
            achievement &&
            achievement.user &&
            achievement.user.id === userId
          ) {
            isCertified = true;
          }
        }

        for (const chapter of course.chapterLectures) {
          if (
            await this.userLectureRepository.checkChapterLectureIsCompletedForCustomer(
              chapter.id,
              userId,
            )
          ) {
            completedCount++;
          }
        }

        response.push(
          this.courserMapper.filterCourseByCustomerResponseFromCourse(
            course,
            course.chapterLectures.length === 0
              ? 0
              : Math.floor(
                  (completedCount / course.chapterLectures.length) * 100,
                ),
            isCertified,
            isFeedback ? courseFeedback.ratedStar : null,
            isFeedback ? courseFeedback.description : null,
          ),
        );

        completedCount = 0;
      }
    }

    this.logger.log(
      `method=getCoursesByUserId, userId=${userId}, length=${response.length}`,
    );

    if (status === CourseLearnStatus.COMPLETED)
      return response.filter(
        (courseLearn) => courseLearn.completedPercent === 100,
      );

    if (status === CourseLearnStatus.LEARNING)
      return response.filter(
        (courseLearn) =>
          courseLearn.completedPercent < 100 &&
          courseLearn.completedPercent > 0,
      );

    if (status === CourseLearnStatus.NOT_LEARNING)
      return response.filter((courseLearn) => {
        return courseLearn.completedPercent === 0;
      });
    return response;
  }

  getCourseId(orderDetails: OrderDetail[]): string[] {
    const results: string[] = [];

    for (const detail of orderDetails) {
      if (!detail.refund || (detail.refund && !detail.refund.isApproved))
        results.push(detail.course.id);
    }

    return results;
  }

  async checkCourseIsOwnedByCourseId(courseId: string, user: User) {
    let status = false;
    const orders = await this.orderRepository.getCoursesByUserId(user.id);

    for (const order of orders)
      order.orderDetails.forEach((orderDetail) => {
        if (
          orderDetail.course.id === courseId &&
          (orderDetail.refund === null ||
            orderDetail.refund.isApproved === false)
        ) {
          status = true;
        }
      });

    return { status };
  }

  async getAllCoursesForStaff(status?: CourseStatus): Promise<Course[]> {
    return await this.courseRepository.getAllCourseByStaff(status);
  }

  async setStatusForCourse(request: SetStatusRequest): Promise<void> {
    const { courseId, reason, status } = request;
    const course = await this.courseRepository.getCourseById(courseId);

    if (status === CourseStatus.BANNED || status === CourseStatus.REJECTED) {
      if (!reason) {
        throw new BadRequestException('Reason can not be null');
      }
    }

    course.status = status;
    course.reason = reason;

    if (status === CourseStatus.BANNED) {
      course.active = false;
      await this.mailsService.sendMail({
        to: course.user.email,
        subject: 'Xóa Khóa Học',
        template: './ban',
        context: {
          SUBJECT: 'Khóa học',
          NAME: course.title,
          REASON: request.reason,
        },
      });
    } else if (status === CourseStatus.REJECTED) {
      course.active = false;
      await this.mailsService.sendMail({
        to: course.user.email,
        subject: 'Từ Chối Xét Duyệt Khóa Học',
        template: './reject',
        context: {
          SUBJECT: 'Khóa học',
          NAME: course.title,
          REASON: request.reason,
        },
      });
    } else if (status === CourseStatus.APPROVED) {
      course.active = true;
      await this.mailsService.sendMail({
        to: course.user.email,
        subject: 'Xét Duyệt Khóa Học Thành Công',
        template: './approve',
        context: {
          SUBJECT: `Khóa học ${course.title}`,
          CONTENT: `Đã Được Xét Duyệt`,
        },
      });
    }

    this.courseRepository.saveCourse(course);

    this.logger.log(
      `method=setStatusForCourse, set status course with id=${request.courseId} successfully`,
    );
  }

  async checkCourseCreateValid(courseId: string) {
    const course = await this.courseRepository.getCourseById(courseId);
    const msgErrors = [];
    const minChapterLectures = 6;

    if (!course) {
      this.logger.error(`Course with id ${courseId} not found`);
      throw new NotFoundException(
        `method=checkCourseCreateValid, Course with id ${courseId} not found`,
      );
    }

    if (
      !course.title ||
      !course.description ||
      !course.prepareMaterial ||
      !course.thumbnailUrl ||
      course.title.trim() === '' ||
      cheerio.load(course.description).root().text().length === 0 ||
      cheerio.load(course.prepareMaterial).root().text().length === 0
    )
      msgErrors.push(
        `Tiêu đề, Miêu tả, Các Yêu cầu cần thiết hoặc Hình ảnh khóa học đang trống`,
      );

    if (
      course.price === null ||
      course.price < 10000 ||
      course.price > 10000000
    )
      msgErrors.push(
        `Giá khóa học đang trống và 10.000VND <= giá khóa học <= 10.000.000VND`,
      );

    if (!course.level || !course.category)
      msgErrors.push('Thể loại hoặc cấp độ đang trống');

    const chapterLectures = course.chapterLectures.filter(
      (lecture) => lecture.active,
    );

    if (chapterLectures.length === 0)
      msgErrors.push(`Bạn hiện chưa tạo bài giảng nào`);
    else {
      if (chapterLectures.length < minChapterLectures)
        msgErrors.push(`Số lượng bài giảng nhỏ nhất là ${minChapterLectures}`);

      let numsOfPreview = 0;
      for (const chapter of chapterLectures) {
        if (chapter.isPreviewed) numsOfPreview++;
        if (
          !chapter.title ||
          !chapter.description ||
          chapter.title.trim() === '' ||
          chapter.description.trim() === '' ||
          (!chapter.video && !chapter.resource)
        )
          msgErrors.push(
            `Bài giảng ${chapter.index} ${chapter.title} có Tiêu đề, Miêu tả trống. Hoặc chưa có video bài giảng hoặc file bài giảng`,
          );
      }

      if (
        chapterLectures.length >= 1 &&
        chapterLectures.length <= 10 &&
        numsOfPreview > 1
      )
        msgErrors.push(
          `Nếu Số lượng bài giảng nhỏ hơn hoặc bằng 10 thì chỉ được xem trước 1 bài giảng`,
        );
      else if (chapterLectures.length > 10 && numsOfPreview > 2)
        msgErrors.push(
          `Nếu Số lượng bài giảng lớn hơn 10 thì chỉ được xem trước 2 bài giảng`,
        );
    }

    if (msgErrors.length === 0) {
      course.status = CourseStatus.PENDING;
      await this.courseRepository.saveCourse(course);
    }

    this.logger.log(
      `method=checkCourseCreateValid, totalLength of messages errors: ${msgErrors.length}`,
    );
    return { msgErrors };
  }

  async checkCourseAndUserIsValid(
    user: User,
    courseId: string,
  ): Promise<{ status: boolean }> {
    if (user.role?.name === NameRole.Instructor) {
      const course =
        await this.courseRepository.getCourseByInstructorIdAndCourseId(
          user.id,
          courseId,
        );

      if (course) return { status: true };
      return { status: false };
    }

    const order = await this.orderRepository.checkOrderExistedByUserAndCourse(
      courseId,
      user.id,
    );

    if (order) {
      return { status: true };
    } else {
      if (
        await this.learnerCourseRepository.getLearnerCourseByCourseAndLearner(
          courseId,
          user.id,
        )
      ) {
        return { status: true };
      } else {
        return { status: false };
      }
    }
  }
}
