import { Injectable, Logger } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category } from './entity/category.entity';
import { CategoryDto } from './dto/response/category.dto';

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService', { timestamp: true });

  constructor(private categoryRepository: CategoryRepository) {}

  async getAllcategories(): Promise<CategoryDto[]> {
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

  configCategoryDto(category: Category): CategoryDto {
    const listCourseActive = category.courses.filter((course) => course.active);
    return {
      ...category,
      totalCourses: listCourseActive.length,
    };
  }
}
