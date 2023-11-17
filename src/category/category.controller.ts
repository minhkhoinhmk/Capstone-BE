import { Controller, Get, Param, Query } from '@nestjs/common';
import { Category } from './entity/category.entity';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/response/category.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('category')
@ApiTags('Category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  findAll(@Query('active') active: string): Promise<CategoryDto[]> {
    return this.categoryService.getAllcategories(active);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }
}
