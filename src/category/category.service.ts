import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category } from './entity/category.entity';
import { CategoryDto } from './dto/response/category.dto';
import { CreateCategotyRequest } from './dto/request/create-category-request.dto';
import { S3Service } from 'src/s3/s3.service';
import { CATEGORY_PATH } from 'src/common/s3/s3.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService', { timestamp: true });

  constructor(
    private categoryRepository: CategoryRepository,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async getAllcategoriesByActive(active: string): Promise<CategoryDto[]> {
    const categoriesDto: CategoryDto[] = [];
    const categories = await this.categoryRepository.getAllCategoriesByActive(
      active === 'true' ? true : false,
    );
    categories.forEach((category) => {
      const categoryDto = this.configCategoryDto(category);
      categoriesDto.push(categoryDto);
    });
    return categoriesDto;
  }

  async getAllcategoriesByAdmin(): Promise<CategoryDto[]> {
    const categoriesDto: CategoryDto[] = [];
    const categories = await this.categoryRepository.getAllCategories();
    categories.forEach((category) => {
      const categoryDto = this.configCategoryDto(category);
      categoriesDto.push(categoryDto);
    });
    return categoriesDto;
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.categoryRepository.getCategoryById(id);
  }

  async createCategory(request: CreateCategotyRequest): Promise<Category> {
    const category = await this.categoryRepository.createCategory(request);

    const createdCategory = await this.categoryRepository.saveCategory(
      category,
    );

    this.logger.log(`Category created successfully`);

    return await this.categoryRepository.getCategoryById(createdCategory.id);
  }

  async updateCategory(
    id: string,
    request: CreateCategotyRequest,
  ): Promise<void> {
    const category = await this.categoryRepository.getCategoryById(id);

    category.name = request.name;

    await this.categoryRepository.saveCategory(category);

    this.logger.log(`Category with id=${id} updated successfully`);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.getCategoryById(id);

    if (category.courses.length <= 0) {
      if (category.thumbnailUrl) {
        const options = {
          Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
          Key: category.thumbnailUrl,
        };

        (await this.s3Service.deleteObject(options)).promise();
      }

      await this.categoryRepository.removeCategory(category);

      this.logger.log(`Category with id=${id} removed successfully`);
    } else {
      throw new NotAcceptableException(`Thể loại đã có khóa học`);
    }
  }

  configCategoryDto(category: Category): CategoryDto {
    const listCourseActive = category.courses.filter((course) => course.active);
    return {
      ...category,
      totalCourses: listCourseActive.length,
    };
  }

  async uploadThumbnail(
    buffer: Buffer,
    type: string,
    substringAfterDot: string,
    categoryId: string,
  ): Promise<void> {
    try {
      const category = await this.categoryRepository.getCategoryById(
        categoryId,
      );
      const key = `${CATEGORY_PATH}${category.id}.${substringAfterDot}`;

      category.thumbnailUrl = key;

      await this.categoryRepository.saveCategory(category);

      await this.s3Service.putObject(buffer, key, type);

      this.logger.log(
        `method=uploadThumbnail, uploaded thumbnail successfully`,
      );
    } catch (error) {
      this.logger.error(`method=uploadThumbnail, error:${error.message}`);
    }
  }
}
