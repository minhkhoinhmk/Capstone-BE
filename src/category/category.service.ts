import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category } from './entity/category.entity';
import { CategoryDto } from './dto/response/category.dto';
import { CreateCategotyRequest } from './dto/request/create-category-request.dto';

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService', { timestamp: true });

  constructor(private categoryRepository: CategoryRepository) {}

  async getAllcategories(active: string): Promise<CategoryDto[]> {
    const categoriesDto: CategoryDto[] = [];
    const categories = await this.categoryRepository.getAllCategories(
      active === 'true' ? true : false,
    );
    categories.forEach((category) => {
      const categoryDto = this.configCategoryDto(category);
      categoriesDto.push(categoryDto);
    });
    return categoriesDto;
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.categoryRepository.getCategoryById(id);
  }

  async createCategory(request: CreateCategotyRequest): Promise<void> {
    const category = await this.categoryRepository.createCategory(request);

    await this.categoryRepository.saveCategory(category);

    this.logger.log(`Category created successfully`);
  }

  async updateCategory(
    id: string,
    request: CreateCategotyRequest,
  ): Promise<void> {
    let category = await this.categoryRepository.getCategoryById(id);

    category.name = request.name;

    await this.categoryRepository.saveCategory(category);

    this.logger.log(`Category with id=${id} updated successfully`);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.getCategoryById(id);

    if (category.courses.length <= 0) {
      await this.categoryRepository.removeCategory(category);

      this.logger.log(`Category with id=${id} removed successfully`);
    } else {
      throw new NotAcceptableException(`Category with id=${id} has courses`);
    }
  }

  configCategoryDto(category: Category): CategoryDto {
    const listCourseActive = category.courses.filter((course) => course.active);
    return {
      ...category,
      totalCourses: listCourseActive.length,
    };
  }
}
