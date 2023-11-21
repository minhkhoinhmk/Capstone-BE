import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostResponse } from './dto/reponse/post.response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { SearchPostRequest } from './dto/request/search-post.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { User } from 'src/user/entity/user.entity';
import { Request } from 'express';
import { PostService } from './post.service';
import { CreatePostRequest } from './dto/request/create-post-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePostRequest } from './dto/request/update-post.request.dto';

@Controller('post')
@ApiTags('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('/search')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOkResponse({
    description: 'Get Posts Successfully',
  })
  @ApiPaginatedResponse(PostResponse)
  async searchPosts(
    @Body() body: SearchPostRequest,
    @Req() request: Request,
  ): Promise<PageDto<PostResponse>> {
    return await this.postService.searchAndFilter(
      body,
      request['user'] as User,
    );
  }

  @Patch()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  async updatePost(
    @Body() body: UpdatePostRequest,
    @Req() request: Request,
  ): Promise<void> {
    return await this.postService.updatePost(body, request['user'] as User);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  @ApiCreatedResponse({
    description: 'Created post Successfully',
  })
  async createPost(
    @Body() body: CreatePostRequest,
    @Req() request: Request,
  ): Promise<void> {
    return await this.postService.createPost(body, request['user'] as User);
  }

  @Get(':postId')
  @ApiCreatedResponse({
    description: 'Get post detail Successfully',
  })
  async getPost(@Param('postId') postId: string): Promise<PostResponse> {
    return await this.postService.getPostById(postId);
  }

  @Post('/thumbnail/upload')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Query('postId') postId: string,
  ) {
    const parts = file.originalname.split('.');

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      return await this.postService.uploadThumbnail(
        file.buffer,
        file.mimetype,
        substringAfterDot,
        postId,
      );
    }
  }
}
