import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Category } from './entity/category.entity';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/response/category.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCategotyRequest } from './dto/request/create-category-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';

@Controller('category')
@ApiTags('Category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @ApiOkResponse({ type: [CategoryDto], description: `List categories` })
  @Get()
  findAll(@Query('active') active: string): Promise<CategoryDto[]> {
    return this.categoryService.getAllcategories(active);
  }

  @Get(':id')
  @ApiOkResponse({ type: Category, description: `Get category by id` })
  @ApiOkResponse({ type: Array, description: `List categories` })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  @ApiCreatedResponse({ description: `Create category` })
  @ApiBody({ type: CreateCategotyRequest })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  createCategory(@Body() category: CreateCategotyRequest): Promise<void> {
    return this.categoryService.createCategory(category);
  }

  @Put('/:id')
  @ApiOkResponse({ description: `Update category` })
  @ApiBody({ type: CreateCategotyRequest })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  updateCategory(
    @Body() category: CreateCategotyRequest,
    @Param('id') id: string,
  ): Promise<void> {
    return this.categoryService.updateCategory(id, category);
  }

  @Delete('/:id')
  @ApiOkResponse({ description: `Delete category` })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoryService.removeCategory(id);
  }
}
