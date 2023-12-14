import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
  FindOptionsOrder,
} from 'typeorm';
import { Post } from './entity/post.entity';
import { SearchPostRequest } from './dto/request/search-post.request.dto';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class PostRepository {
  private logger = new Logger('PostRepository', { timestamp: true });

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async filter(
    user: User,
    searchPostRequest: SearchPostRequest,
  ): Promise<{ count: number; entities: Post[] }> {
    const { pageOptions, ...searchCriterias } = searchPostRequest;

    const findOptionsWhere: FindOptionsWhere<Post> = {};
    const findOptionsOrders: FindOptionsOrder<Post> = {};

    if (searchCriterias.active)
      findOptionsWhere.active = searchCriterias.active;

    if (searchCriterias.search)
      findOptionsWhere.title = ILike(`%${searchCriterias.search}%`);

    if (searchCriterias.sortCriterias.length > 0) {
      searchCriterias.sortCriterias.forEach(({ field, order }) => {
        findOptionsOrders[field] = order;
      });
    } else findOptionsOrders.updatedDate = 'DESC';

    const findManyOptions: FindManyOptions<Post> = {
      where: findOptionsWhere,
      skip: (pageOptions.page - 1) * pageOptions.take,
      take: pageOptions.take,
      order: findOptionsOrders,
      relations: {
        user: true,
      },
    };

    return {
      count: await this.postRepository.count(findManyOptions),
      entities: await this.postRepository.find(findManyOptions),
    };
  }

  async savePost(post: Post): Promise<Post> {
    return this.postRepository.save(post);
  }

  async getPostById(postId: string) {
    return this.postRepository.findOne({
      where: { id: postId },
      relations: { user: true },
    });
  }

  async deletePost(post: Post): Promise<Post> {
    return this.postRepository.remove(post);
  }
}
