import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Course } from './entity/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import SortField from './type/enum/SortField';

@Injectable()
export class CourseRepository {
  private logger = new Logger('CourseRepository', { timestamp: true });

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async filter(
    searchCriteria: {
      levels: string[];
      categories: string[];
      search: string;
      sortField: SortField;
    },
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ count: number; entites: Course[] }> {
    const queryBuilder = this.courseRepository.createQueryBuilder('c');
    const { categories, levels, search, sortField } = searchCriteria;

    categories.length > 0 &&
      queryBuilder.andWhere('c.category IN (:...categories)', { categories });

    levels.length > 0 &&
      queryBuilder.andWhere('c.level IN (:...levels)', { levels });

    search &&
      queryBuilder.andWhere('c.title LIKE :search', {
        search: `%${search}%`,
      });

    if (sortField) {
      if (this.checkSortField(sortField))
        queryBuilder.orderBy(`c.${sortField}`, pageOptionsDto.order);
      else throw new BadRequestException(`Sort field not valid: ${sortField}`);
    } else queryBuilder.orderBy(`c.publishedDate`, 'DESC');

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
    const entites = await queryBuilder.getMany();
    const count = await queryBuilder.getCount();

    return { count, entites };
  }

  convertAnyToArrayOfString(input: any): string[] {
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

  checkSortField(field: SortField): boolean {
    const enums: string[] = [SortField.PRICE, SortField.PUBLISHED_DATE];

    if (enums.includes(field)) {
      return true;
    } else {
      return false;
    }
  }

  async getCourseById(id: string) {
    return this.courseRepository.findOne({
      where: { id },
      relations: { cartItems: true },
    });
  }
}
