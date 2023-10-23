import { Injectable, Logger } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { Course } from './entity/course.entity';
import { SearchCourseReponse } from './dto/reponse/search-course-response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { SearchCourseRequest } from './dto/request/search-course-request.dto';
import { CourseDetailResponse } from './dto/reponse/course-detail-response.dto';
import { NameRole } from 'src/role/enum/name-role.enum';
import { OrderRepository } from 'src/order/order.repository';
import { FilterCourseByUserResponse } from './dto/reponse/filter-by-user.dto';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';

@Injectable()
export class CourseService {
  private logger = new Logger('CourseService', { timestamp: true });

  constructor(
    private courseRepository: CourseRepository,
    private orderRepoasitory: OrderRepository,
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
    const course = await this.courseRepository.getCourseDetailById(courseId);

    const totalLength = this.sumTotalLength(course)
      ? this.sumTotalLength(course)
      : 0;
    const ratedStar = this.countRatedStar(course)
      ? this.countRatedStar(course)
      : 0;
    const { sumDiscount, promotionCourseByStaffId } =
      this.getDiscountOfStaff(course);
    const discounntPrice = course.price - course.price * (sumDiscount / 100);

    const response = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      discount: sumDiscount,
      discountPrice: discounntPrice,
      promotionCourseByStaffId,
      ratedStar: ratedStar,
      authorId: course.user.id,
      author: `${course.user.firstName} ${course.user.middleName} ${course.user.lastName}`,
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
      const isStaff = promotionCourse.promotion.user.roles.some(
        (role) => role.name === NameRole.Staff,
      );
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
    const discounntPrice = course.price - course.price * (sumDiscount / 100);

    const courseResponse: SearchCourseReponse = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,

      discount: sumDiscount,
      discountPrice: discounntPrice,
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
  ): Promise<FilterCourseByUserResponse[]> {
    const orders = await this.orderRepoasitory.getCoursesByUserId(userId);
    let response: FilterCourseByUserResponse[] = [];

    for (const order of orders) {
      const courseIds = this.getCourseId(order.orderDetails);
      for (const courseId of courseIds) {
        const course = await this.courseRepository.getCourseById(courseId);
        response.push({
          id: course.id,
          title: course.title,
          description: course.description,
          prepareMaterial: course.prepareMaterial,
          publishedDate: course.publishedDate,
          price: course.price,
          active: course.active,
          shortDescription: course.shortDescription,
          totalBought: course.totalBought,
          totalChapter: course.totalChapter,
          thumbnailUrl: course.thumbnailUrl,
          status: course.status,
        });
      }
    }
    this.logger.log(
      `method=getCoursesByUserId, userId=${userId}, length=${response.length}`,
    );
    return response;
  }

  getCourseId(orderDetails: OrderDetail[]): string[] {
    let results: string[] = [];

    for (const detail of orderDetails) {
      results.push(detail.course.id);
    }

    return results;
  }
}
