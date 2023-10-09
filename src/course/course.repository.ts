import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Course } from './entity/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';

@Injectable()
export class CourseRepository {
  private logger = new Logger('CourseRepository', { timestamp: true });

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async filter(
    searchCriteria: any,
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ count; entites }> {
    const queryBuilder = this.courseRepository.createQueryBuilder('c');

    if (searchCriteria.categories) {
      const categories: string[] = await this.convertAnyToArrayOfString(
        searchCriteria.categories,
      );
      queryBuilder.andWhere('c.category IN (:...categories)', { categories });
    }

    if (searchCriteria.levels) {
      const levels: string[] = await this.convertAnyToArrayOfString(
        searchCriteria.levels,
      );
      queryBuilder.andWhere('c.level IN (:...levels)', { levels });
    }

    if (searchCriteria.search) {
      const search = searchCriteria.search;
      if (search) {
        queryBuilder.andWhere('c.title LIKE :search', {
          search: `%${search}%`,
        });
      }
    }

    if (searchCriteria.sortField) {
      if (await this.checkSortField(searchCriteria.sortField)) {
        queryBuilder.orderBy(
          `c.${searchCriteria.sortField}`,
          pageOptionsDto.order,
        );
      } else {
        throw new BadRequestException(
          'Sort field not valid: ' + searchCriteria.sortField,
        );
      }
    } else {
      queryBuilder.orderBy(`c.publishedDate`, 'DESC');
    }

    queryBuilder.andWhere('c.active = :active', {
      active: true,
    });

    queryBuilder.leftJoinAndSelect('c.promotionCourses', 'promotionCourses');
    queryBuilder.leftJoinAndSelect('promotionCourses.promotion', 'promotion');
    queryBuilder.leftJoinAndSelect('c.courseFeedbacks', 'courseFeedbacks');
    queryBuilder.leftJoinAndSelect('c.chapterLectures', 'chapterLectures');
    queryBuilder.leftJoinAndSelect('c.level', 'level');
    queryBuilder.leftJoinAndSelect('c.user', 'user');

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const entites = queryBuilder.getMany();
    const count = queryBuilder.getCount();

    return { count, entites };
  }

  async convertAnyToArrayOfString(input: any): Promise<string[]> {
    if (Array.isArray(input)) {
      // If 'input' is already an array, ensure that all elements are strings
      return input.filter((item) => typeof item === 'string');
    } else if (typeof input === 'string') {
      // If 'input' is a single string, convert it to an array with one element
      return [input];
    } else {
      // Handle other cases or return an empty array if needed
      return [];
    }
  }

  async checkSortField(field: string): Promise<boolean> {
    const enums: string[] = ['price', 'publishedDate'];

    if (enums.includes(field)) {
      return true;
    } else {
      return false;
    }
  }
}
