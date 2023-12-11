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
import CustomerDrawingStatus from './enum/customer-drawing-status.enum';

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
      status: CustomerDrawingStatus.PENDING,
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
    queryBuilder.andWhere('c.status = :status', {
      status: CustomerDrawingStatus.APPROVED,
    });
    queryBuilder.andWhere('c.contest.id = :id', { id: contestId });

    queryBuilder.leftJoinAndSelect('c.user', 'user');
    queryBuilder.leftJoinAndSelect('c.contest', 'contest');
    queryBuilder.leftJoinAndSelect('c.votes', 'votes');
    queryBuilder.leftJoinAndSelect('votes.user', 'votesUser');

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

  async getCustomerDrawingByContestId(contestId: string) {
    return this.customerDrawingRepository.find({
      where: {
        contest: {
          id: contestId,
        },
      },
      relations: {
        user: true,
        votes: true,
      },
    });
  }

  async getCustomerDrawing(
    request: FilterCustomerDrawingRequest,
  ): Promise<{ count: number; entites: CustomerDrawing[] }> {
    const pageOptionsDto: PageOptionsDto = request.pageOptions;

    const queryBuilder = this.customerDrawingRepository.createQueryBuilder('c');
    queryBuilder.andWhere('c.active = :active', { active: true });
    queryBuilder.andWhere('c.status = :status', {
      status: CustomerDrawingStatus.APPROVED,
    });

    queryBuilder.leftJoinAndSelect('c.user', 'user');
    queryBuilder.leftJoinAndSelect('c.contest', 'contest');
    queryBuilder.leftJoinAndSelect('c.votes', 'votes');
    queryBuilder.leftJoinAndSelect('votes.user', 'votesUser');

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

  async defineWinner(contestId: string): Promise<CustomerDrawing[]> {
    const queryBuilder = this.customerDrawingRepository.createQueryBuilder('c');
    queryBuilder.andWhere('c.active = :active', { active: true });
    queryBuilder.andWhere('c.status = :status', {
      status: CustomerDrawingStatus.APPROVED,
    });
    queryBuilder.andWhere('c.contest.id = :id', { id: contestId });

    queryBuilder.leftJoinAndSelect('c.user', 'user');
    queryBuilder.leftJoinAndSelect('c.contest', 'contest');
    queryBuilder.leftJoinAndSelect('c.votes', 'votes');

    let entites: CustomerDrawing[];

    entites = await queryBuilder.getMany().then((data) =>
      data
        .map((a) => ({ ...a, total_likes: a.votes.length }))
        .sort(function (a, b) {
          if (b.total_likes !== a.total_likes) {
            return b.total_likes - a.total_likes;
          }
          return (
            new Date(a.insertedDate).getTime() -
            new Date(b.insertedDate).getTime()
          );
        })
        .slice(0, 3),
    );

    return entites;
  }

  async checkCustomerDrawingExisted(
    contestId: string,
    userId: string,
  ): Promise<CustomerDrawing[]> {
    return this.customerDrawingRepository.find({
      where: { user: { id: userId }, contest: { id: contestId } },
    });
  }
}
