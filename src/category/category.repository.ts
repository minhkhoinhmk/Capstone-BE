import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entity/category.entity';
import { CreateCategotyRequest } from './dto/request/create-category-request.dto';

@Injectable()
export class CategoryRepository {
  private logger = new Logger('CategoryRepository', { timestamp: true });

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAllCategories(active: boolean): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { active },
      relations: { courses: true },
    });
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: { courses: true },
    });
  }

  async createCategory(request: CreateCategotyRequest): Promise<Category> {
    return this.categoryRepository.create({
      name: request.name,
      active: true,
    });
  }

  async saveCategory(category: Category): Promise<void> {
    await this.categoryRepository.save(category);
  }

  async removeCategory(category: Category): Promise<void> {
    await this.categoryRepository.remove(category);
  }
}
