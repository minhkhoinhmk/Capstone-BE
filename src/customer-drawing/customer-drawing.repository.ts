import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerDrawing } from './entity/customer-drawing.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDrawingRequest } from './dto/request/create-customer-drawing-request.dto';
import { User } from 'src/user/entity/user.entity';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { Contest } from 'src/contest/entity/contest.entity';

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
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ count: number; entites: CustomerDrawing[] }> {
    const customerDrawings = await this.customerDrawingRepository.find({
      where: { active: true, approved: true, contest: { id: contestId } },
      relations: { user: true, contest: true, votes: true },
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      take: pageOptionsDto.take,
    });

    const entites = customerDrawings;
    const count = await this.customerDrawingRepository.count({
      where: { active: true, approved: true, contest: { id: contestId } },
    });

    return { count, entites };
  }
}
