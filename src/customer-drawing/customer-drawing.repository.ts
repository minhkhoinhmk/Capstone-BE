import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerDrawing } from './entity/customer-drawing.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDrawingRequest } from './dto/request/create-customer-drawing-request.dto';
import { User } from 'src/user/entity/user.entity';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { Contest } from 'src/contest/entity/contest.entity';
import { FilterCustomerDrawingRequest } from './dto/request/filter-customer-drawing-request.dto';
import CustomerDrawingSortField from './enum/customer-drawing-sort-field';

@Injectable()
export class CustomerDrawingRepository {
  constructor(
    @InjectRepository(CustomerDrawing)
    private customerDrawingRepository: Repository<CustomerDrawing>,
  ) {}

  async createCustomerDrawing(
    request: CreateCustomerDrawingRequest,
    user: User,
    contest: Contest,
    insertedDate: Date,
  ): Promise<CustomerDrawing> {
    return this.customerDrawingRepository.create({
      title: request.title,
      description: request.description,
      imageUrl: null,
      insertedDate: insertedDate,
      updatedDate: null,
      approved: false,
      active: false,
      user,
      contest,
    });
  }

  async saveCustomerDrawing(
    customerDrawing: CustomerDrawing,
  ): Promise<CustomerDrawing> {
    return await this.customerDrawingRepository.save(customerDrawing);
  }

  async getCustomerDrawingByIdForUpdateImageUrl(
    id: string,
  ): Promise<CustomerDrawing> {
    return await this.customerDrawingRepository.findOne({
      where: { id: id },
      relations: { user: true, contest: true },
    });
  }

  async getCustomerDrawingByContest(
    contestId: string,
    request: FilterCustomerDrawingRequest,
  ): Promise<{ count: number; entites: CustomerDrawing[] }> {
    const pageOptionsDto: PageOptionsDto = request.pageOptions;

    const queryBuilder = this.customerDrawingRepository.createQueryBuilder('c');
    queryBuilder.andWhere('c.active = :active', { active: true });
    queryBuilder.andWhere('c.approved = :approved', { approved: true });
    queryBuilder.andWhere('c.contest.id = :id', { id: contestId });

    queryBuilder.leftJoinAndSelect('c.user', 'user');
    queryBuilder.leftJoinAndSelect('c.contest', 'contest');
    queryBuilder.leftJoinAndSelect('c.votes', 'votes');

    queryBuilder
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    let entites: CustomerDrawing[];
    let count: number = 0;

    if (request.customerDrawingSortField === CustomerDrawingSortField.VOTE) {
      entites = await queryBuilder.getMany().then((data) =>
        data
          .map((a) => ({ ...a, total_likes: a.votes.length }))
          .sort(function (a, b) {
            if (request.pageOptions.order === 'DESC')
              return b.total_likes - a.total_likes;
            else return a.total_likes - b.total_likes;
          }),
      );
      count = await queryBuilder.getCount();
    }

    return { count, entites };
  }

  async getCustomerDrawing(
    request: FilterCustomerDrawingRequest,
  ): Promise<{ count: number; entites: CustomerDrawing[] }> {
    const pageOptionsDto: PageOptionsDto = request.pageOptions;

    const queryBuilder = this.customerDrawingRepository.createQueryBuilder('c');
    queryBuilder.andWhere('c.active = :active', { active: true });
    queryBuilder.andWhere('c.approved = :approved', { approved: true });

    queryBuilder.leftJoinAndSelect('c.user', 'user');
    queryBuilder.leftJoinAndSelect('c.contest', 'contest');
    queryBuilder.leftJoinAndSelect('c.votes', 'votes');

    queryBuilder
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    let entites: CustomerDrawing[];
    let count: number = 0;

    if (request.customerDrawingSortField === CustomerDrawingSortField.VOTE) {
      entites = await queryBuilder.getMany().then((data) =>
        data
          .map((a) => ({ ...a, total_likes: a.votes.length }))
          .sort(function (a, b) {
            if (request.pageOptions.order === 'DESC')
              return b.total_likes - a.total_likes;
            else return a.total_likes - b.total_likes;
          }),
      );
      count = await queryBuilder.getCount();
    } else {
      queryBuilder.orderBy(
        `c.${request.customerDrawingSortField}`,
        pageOptionsDto.order,
      );
      entites = await queryBuilder.getMany();
      count = await queryBuilder.getCount();
    }

    return { count, entites };
  }
}
