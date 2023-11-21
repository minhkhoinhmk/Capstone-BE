import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Course } from './entity/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import SortField from './type/enum/SortField';
import { CourseStatus } from './type/enum/CourseStatus';

@Injectable()
export class CourseRepository {
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
      queryBuilder.andWhere('c.title ILIKE :search', {
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

    queryBuilder
      .leftJoinAndSelect('c.promotionCourses', 'promotionCourses')
      .leftJoinAndSelect('promotionCourses.promotion', 'promotion')
      .leftJoinAndSelect('promotion.user', 'promotionUser')
      .leftJoinAndSelect('promotionUser.role', 'promotionUserRoles')
      .leftJoinAndSelect('c.courseFeedbacks', 'courseFeedbacks')
      .leftJoinAndSelect('c.chapterLectures', 'chapterLectures')
      .leftJoinAndSelect('c.level', 'level')
      .leftJoinAndSelect('c.user', 'user');

    queryBuilder
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);
    const entites = await queryBuilder.getMany();
    const count = await queryBuilder.getCount();

    return { count, entites };
  }

  async getCourseDetailById(courseId: string): Promise<Course> {
    const queryBuilder = this.courseRepository.createQueryBuilder('c');

    queryBuilder.andWhere('c.id = :courseId', {
      courseId: `${courseId}`,
    });

    queryBuilder.andWhere('c.active = :active', {
      active: true,
    });

    queryBuilder.leftJoinAndSelect('c.promotionCourses', 'promotionCourses');
    queryBuilder.leftJoinAndSelect('promotionCourses.promotion', 'promotion');
    queryBuilder.leftJoinAndSelect('promotion.user', 'promotionUser');
    queryBuilder.leftJoinAndSelect('promotionUser.role', 'promotionUserRoles');
    queryBuilder.leftJoinAndSelect('c.courseFeedbacks', 'courseFeedbacks');
    queryBuilder.leftJoinAndSelect('c.chapterLectures', 'chapterLectures');
    queryBuilder.leftJoinAndSelect('c.level', 'level');
    queryBuilder.leftJoinAndSelect('c.category', 'category');
    queryBuilder.leftJoinAndSelect('c.user', 'user');

    const course = await queryBuilder.getOne();

    return course;
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
      relations: { cartItems: true, chapterLectures: true, user: true },
    });
  }

  async saveCourse(course: Course): Promise<Course> {
    return this.courseRepository.save(course);
  }

  async getCoursesByInstructorId(
    instructorId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ count: number; entities: Course[] }> {
    const whereOptions: FindOptionsWhere<Course> = {
      user: {
        id: instructorId,
      },
    };

    const entities = await this.courseRepository.find({
      where: whereOptions,
      relations: {
        user: true,
      },
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      take: pageOptionsDto.take,
    });

    const count = await this.courseRepository.count({
      where: whereOptions,
    });

    return { count: count, entities: entities };
  }

  async getCourseForStaff(
    pageOptionsDto: PageOptionsDto,
    status: CourseStatus,
  ): Promise<{ count: number; entities: Course[] }> {
    const entities = await this.courseRepository.find({
      where: { status: status },
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      take: pageOptionsDto.take,
    });

    const count = await this.courseRepository.count({
      where: { status: status },
    });

    return { count: count, entities: entities };
  }
}
