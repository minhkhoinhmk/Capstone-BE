import { Injectable, Logger } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { Course } from './entity/course.entity';
import { SearchCourseReponse } from './dto/reponse/search-course-response.dto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { SearchCourseRequest } from './dto/request/search-course-request.dto';

@Injectable()
export class CourseService {
  private logger = new Logger('CourseService', { timestamp: true });

  constructor(private courseRepository: CourseRepository) {}

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
      const totalLength = this.sumTotalLength(course)
        ? this.sumTotalLength(course)
        : 0;
      const ratedStar = this.countRatedStar(course)
        ? this.countRatedStar(course)
        : 0;
      const sumDiscount = this.getDiscount(course);
      const discounntPrice = course.price - course.price * (sumDiscount / 100);

      responses.push({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        discount: sumDiscount,
        discountPrice: discounntPrice,
        ratedStar: ratedStar,
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
      });
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

  countRatedStar(course: Course): number {
    const allRatedStar = course.courseFeedbacks.reduce(
      (accumulator, currentValue) => {
        return { ratedStar: accumulator.ratedStar + currentValue.ratedStar };
      },
      { ratedStar: 0 },
    );
    return allRatedStar.ratedStar / course.courseFeedbacks.length;
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

  getDiscount(course: Course): number {
    let sumDiscount = 0;

    course.promotionCourses.forEach((promotionCourse) => {
      if (
        new Date() <= promotionCourse.expiredDate &&
        new Date() >= promotionCourse.effectiveDate
      ) {
        sumDiscount = sumDiscount + promotionCourse.promotion.discountPercent;
      }
    });

    return sumDiscount;
  }
}
