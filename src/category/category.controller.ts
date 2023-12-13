import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category')
@ApiTags('Category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @ApiOkResponse({ type: [CategoryDto], description: `List categories` })
  @Get()
  findAllByActive(@Query('active') active: string): Promise<CategoryDto[]> {
    return this.categoryService.getAllcategoriesByActive(active);
  }

  @ApiOkResponse({ type: [CategoryDto], description: `List categories` })
  @Get('/admin')
  findAllByAdmin(): Promise<CategoryDto[]> {
    return this.categoryService.getAllcategoriesByAdmin();
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
  createCategory(@Body() category: CreateCategotyRequest): Promise<Category> {
    return this.categoryService.createCategory(category);
  }

  @Patch('/:id')
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

  @Put('/thumbnail')
  @ApiOkResponse({
    description: 'Uploaded Thumbnail Successfully',
  })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Query('categoryId') categoryId: string,
  ): Promise<void> {
    const parts = file.originalname.split('.');

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      return await this.categoryService.uploadThumbnail(
        file.buffer,
        file.mimetype,
        substringAfterDot,
        categoryId,
      );
    }
  }
}
