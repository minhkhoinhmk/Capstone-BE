import { Injectable, Logger } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { Course } from './entity/course.entity';
import { SearchCourseReponse } from './dto/reponse/search-course-response.dto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';

@Injectable()
export class CourseService {
  private logger = new Logger('CourseService', { timestamp: true });

  constructor(private courseRepository: CourseRepository) {}

  async searchAndFilter(
    searchCriteria: any,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<SearchCourseReponse>> {
    let courses: Course[];
    let responses: SearchCourseReponse[] = [];

    const { count, entites } = await this.courseRepository.filter(
      searchCriteria,
      pageOptionsDto,
    );

    courses = await entites;

    for (const course of courses) {
      const totalLength = (await this.sumTotalLength(course))
        ? await this.sumTotalLength(course)
        : 0;
      const ratedStar = (await this.countRatedStar(course))
        ? await this.countRatedStar(course)
        : 0;
      const sumDiscount = await this.getDiscount(course);
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

    const itemCount = await count;

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    ``;

    this.logger.log(
      `method=searchAndFilter, totalItem=${pageMetaDto.itemCount}`,
    );

    return new PageDto(responses, pageMetaDto);
  }

  async countRatedStar(course: Course): Promise<number> {
    const allRatedStar = course.courseFeedbacks.reduce(
      (accumulator, currentValue) => {
        return { ratedStar: accumulator.ratedStar + currentValue.ratedStar };
      },
      { ratedStar: 0 },
    );
    return allRatedStar.ratedStar / course.courseFeedbacks.length;
  }

  async sumTotalLength(course: Course): Promise<number> {
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

  async getDiscount(course: Course): Promise<number> {
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
