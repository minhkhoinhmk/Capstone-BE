import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entity/category.entity';

@Injectable()
export class CategoryRepository {
  private logger = new Logger('CategoryRepository', { timestamp: true });

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAllCategories() {
    return this.categoryRepository.find({
      where: { active: true },
      relations: { courses: true },
    });
  }

  async getCategoryById(id: string) {
    return this.categoryRepository.findOne({
      where: { id },
    });
  }
}
