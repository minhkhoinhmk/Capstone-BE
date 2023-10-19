import { Controller, Get, Param } from '@nestjs/common';
import { Category } from './entity/category.entity';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/response/category.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  findAll(): Promise<CategoryDto[]> {
    return this.categoryService.getAllcategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }
}
