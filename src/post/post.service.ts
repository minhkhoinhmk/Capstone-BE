import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostResponse } from './dto/reponse/post.response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { SearchPostRequest } from './dto/request/search-post.request.dto';
import { User } from 'src/user/entity/user.entity';
import { UpdatePostRequest } from './dto/request/update-post.request.dto';
import { PostMapper } from './mapper/post.mapper';
import { PostDynamodbRepository } from './post.dynamodb.repository';
import { CreatePostRequest } from './dto/request/create-post-request.dto';
import { Post } from './entity/post.entity';
import { POST_THUBMNAIL_PATH } from 'src/common/s3/s3.constants';
import { S3Service } from 'src/s3/s3.service';
import { isUndefined } from 'util';

@Injectable()
export class PostService {
  private logger = new Logger('PostService', { timestamp: true });

  constructor(
    private postRepository: PostRepository,
    private postDynamodbRepository: PostDynamodbRepository,
    private postMapper: PostMapper,
    private readonly s3Service: S3Service,
  ) {}

  async createPost(body: CreatePostRequest, user: User) {
    const post = new Post();
    post.user = user;
    post.title = body.title;
    post.description = body.description;
    post.active = false;

    const savePost = await this.postRepository.savePost(post);

    await this.postDynamodbRepository.createPost(savePost.id, body.resources);
  }

  async updatePost(body: UpdatePostRequest, user: User) {
    const { postId, active, description, resources, title } = body;
    const post = await this.postRepository.getPostById(body.postId);
    if (!post) {
      this.logger.error(`method=updatePost, postId=${postId} is not found`);
      throw new BadRequestException(`postId=${postId} is not found`);
    }

    post.updatedBy = user;
    if (title) post.title = title;
    if (description) post.description = description;
    if (!isUndefined(active)) post.active = active;
    if (resources) {
      try {
        await this.postDynamodbRepository.updatePostBody(postId, resources);
      } catch (error) {
        this.logger.error(
          `method=updatePost, update post resouces to dynamodb with postId=${postId} failed`,
          error.message,
        );
        throw new BadRequestException(
          `update post resouces to dynamodb with postId=${postId} failed`,
        );
      }
    }

    await this.postRepository.savePost(post);
  }

  async getPostById(postId: string): Promise<PostResponse> {
    const post = await this.postRepository.getPostById(postId);

    if (!post) {
      this.logger.error(`method=getPostById, postId=${postId} is not found`);
      throw new BadRequestException(`postId=${postId} is not found`);
    }

    try {
      const postFromDynamodb = await this.postDynamodbRepository.findByPostId(
        postId,
      );
      return this.postMapper.filterPostResponse({
        ...post,
        resources: postFromDynamodb.body,
      });
    } catch (error) {
      this.logger.error(`method=getPostById, error=${error.message}`);
      throw new BadRequestException();
    }
  }

  async searchAndFilter(
    searchPostRequest: SearchPostRequest,
    user: User,
  ): Promise<PageDto<PostResponse>> {
    const { entities, count } = await this.postRepository.filter(
      user,
      searchPostRequest,
    );

    const responses: PostResponse[] = [];
    const listPromises = [];

    for (const post of entities) {
      listPromises.push(this.postDynamodbRepository.findByPostId(post.id));

      responses.push(this.postMapper.filterPostResponse(post));
    }

    if (listPromises.length > 0) {
      try {
        const listPostDynamodb = await Promise.all(listPromises);

        listPostDynamodb.forEach((postDynamodb) => {
          return responses.forEach((post) => {
            if (post.id === postDynamodb.postId)
              post.resources = postDynamodb.body;
          });
        });
      } catch (error) {
        this.logger.error(`method=searchAndFilter, error=${error.message}`);
      }
    }

    const pageMetaDto = new PageMetaDto({
      itemCount: count,
      pageOptionsDto: searchPostRequest.pageOptions,
    });

    this.logger.log(
      `method=searchAndFilter, totalItem=${pageMetaDto.itemCount}`,
    );

    return new PageDto(responses, pageMetaDto);
  }

  async uploadThumbnail(
    buffer: Buffer,
    type: string,
    substringAfterDot: string,
    postId: string,
  ): Promise<void> {
    try {
      const key = `${POST_THUBMNAIL_PATH}${postId}.${substringAfterDot}`;

      const post = await this.postRepository.getPostById(postId);
      if (!post) {
        this.logger.error(
          `method=uploadThumbnail, postId=${postId} is not found`,
        );
        throw new BadRequestException(`postId=${postId} is not found`);
      }
      post.thumbnail = key;

      await this.postRepository.savePost(post);

      await this.s3Service.putObject(buffer, key, type);

      this.logger.log(
        `method=uploadThumbnail, uploaded thumbnail successfully`,
      );
    } catch (error) {
      this.logger.log(`method=uploadThumbnail, error: ${error.message}`);
    }
  }
}
