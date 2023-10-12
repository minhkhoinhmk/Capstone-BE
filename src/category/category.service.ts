import { Injectable, Logger } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category } from './entity/category.entity';

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService', { timestamp: true });

  constructor(private categoryRepository: CategoryRepository) {}

  async getAllcategories(): Promise<Category[]> {
    return this.categoryRepository.getAllCategories();
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.categoryRepository.getCategoryById(id);
  }
}
