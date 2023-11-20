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
import { FilterCourseByStaffResponse } from './dto/reponse/filter-by-staff.dt';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { SetStatusRequest } from './dto/request/set-status-request.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CourseService {
  private logger = new Logger('CourseService', { timestamp: true });

  constructor(
    private courseRepository: CourseRepository,
    private orderRepository: OrderRepository,
    private courserMapper: CourseMapper,
    private mailsService: MailerService,
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
      const { sumDiscount, promotionCourseByStaffId } =
        this.getDiscountOfStaff(course);
      const discountPrice = course.price - course.price * (sumDiscount / 100);

      const response = {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        discount: sumDiscount,
        discountPrice: discountPrice,
        promotionCourseByStaffId,
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

  getDiscountOfStaff(course: Course): {
    sumDiscount: number;
    promotionCourseByStaffId: string | null;
  } {
    let sumDiscount = 0;
    let promotionCourseByStaffId = null;
    const currentDate = new Date();

    course.promotionCourses.forEach((promotionCourse) => {
      const isStaff =
        promotionCourse.promotion.user.role.name === NameRole.Staff;
      if (
        currentDate <= promotionCourse.expiredDate &&
        currentDate >= promotionCourse.effectiveDate &&
        promotionCourse.active &&
        promotionCourse.promotion.active &&
        isStaff
      ) {
        sumDiscount = sumDiscount + promotionCourse.promotion.discountPercent;
        promotionCourseByStaffId = promotionCourse.id;
      }
    });

    return { promotionCourseByStaffId, sumDiscount };
  }

  configCourseResponse(course: Course): SearchCourseReponse {
    const totalLength = this.sumTotalLength(course)
      ? this.sumTotalLength(course)
      : 0;
    const ratedStar = this.countRatedStar(course)
      ? this.countRatedStar(course)
      : 0;
    const { sumDiscount, promotionCourseByStaffId } =
      this.getDiscountOfStaff(course);
    const discountPrice = course.price - course.price * (sumDiscount / 100);

    const courseResponse: SearchCourseReponse = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,

      discount: sumDiscount,
      discountPrice: discountPrice,
      promotionCourseByStaffId,
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
  ): Promise<FilterCourseByCustomerResponse[]> {
    const orders = await this.orderRepository.getCoursesByUserId(userId);
    const response: FilterCourseByCustomerResponse[] = [];

    for (const order of orders) {
      const courseIds = this.getCourseId(order.orderDetails);
      for (const courseId of courseIds) {
        const course = await this.courseRepository.getCourseById(courseId);
        response.push(
          this.courserMapper.filterCourseByCustomerResponseFromCourse(course),
        );
      }
    }
    this.logger.log(
      `method=getCoursesByUserId, userId=${userId}, length=${response.length}`,
    );
    return response;
  }

  getCourseId(orderDetails: OrderDetail[]): string[] {
    const results: string[] = [];

    for (const detail of orderDetails) {
      results.push(detail.course.id);
    }

    return results;
  }

  async checkCourseIsOwnedByCourseId(courseId: string, user: User) {
    let status = false;
    const orders = await this.orderRepository.getCoursesByUserId(user.id);

    for (const order of orders)
      order.orderDetails.forEach((orderDetail) => {
        if (orderDetail.course.id === courseId) status = true;
      });

    return { status };
  }

  async getCoursesForStaff(
    pageOption: PageOptionsDto,
    status: CourseStatus,
  ): Promise<PageDto<FilterCourseByStaffResponse>> {
    const { count, entities } = await this.courseRepository.getCourseForStaff(
      pageOption,
      status,
    );

    const responses: FilterCourseByStaffResponse[] = [];

    for (const course of entities) {
      responses.push(
        this.courserMapper.filterCourseByStaffResponseFromCourse(course),
      );
    }

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
    });

    this.logger.log(`method=getCoursesForStaff, totalItems=${count}`);

    return new PageDto(responses, pageMetaDto);
  }

  async setStatusForCourse(request: SetStatusRequest): Promise<void> {
    const course = await this.courseRepository.getCourseById(request.courseId);

    if (
      request.status === CourseStatus.BANNED ||
      request.status === CourseStatus.REJECTED
    ) {
      if (request.reason === null || request.reason === '') {
        throw new BadRequestException('Reason can not be null');
      }
    }

    course.status = request.status;
    course.reason = request.reason;

    if (request.status === CourseStatus.BANNED) {
      course.active = false;
      await this.mailsService.sendMail({
        to: course.user.email,
        subject: 'Xóa Khóa Học',
        template: './ban',
        context: {
          COURSE_NAME: course.title,
          REASON: request.reason,
        },
      });
    } else if (request.status === CourseStatus.REJECTED) {
      course.active = false;
      await this.mailsService.sendMail({
        to: course.user.email,
        subject: 'Từ Chối Xét Duyệt Khóa Học',
        template: './reject',
        context: {
          COURSE_NAME: course.title,
          REASON: request.reason,
        },
      });
    }

    this.courseRepository.saveCourse(course);

    this.logger.log(
      `method=setStatusForCourse, set status course with id=${request.courseId} successfully`,
    );
  }
}
