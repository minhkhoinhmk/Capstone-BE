import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contest } from './entity/contest.entity';
import { LessThan, Repository } from 'typeorm';
import { CreateContestRequest } from './dto/request/create-contest-request.dto';
import ContestStatus from './enum/contest-status.enum';
import { FilterContestRequest } from './dto/request/filter-contest-request.dto';
import { NameRole } from 'src/role/enum/name-role.enum';

@Injectable()
export class ContestRepository {
  constructor(
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
  ) {}

  async createContest(
    request: CreateContestRequest,
    status: ContestStatus,
  ): Promise<Contest> {
    return this.contestRepository.create({
      title: request.title,
      description: request.description,
      thumbnailUrl: null,
      insertedDate: new Date(),
      prize: request.prize,
      startedDate: new Date(request.startedDate),
      expiredDate: new Date(request.expiredDate),
      active: true,
      status: status,
      isVisible: request.isVisible,
      isPrized: false,
    });
  }

  async save(contest: Contest): Promise<Contest> {
    return await this.contestRepository.save(contest);
  }

  async getContestById(id: string): Promise<Contest> {
    return await this.contestRepository.findOne({
      where: { id: id, active: true },
      relations: {
        user: true,
        customerDrawings: true,
        winners: {
          promotion: true,
        },
      },
    });
  }

  async getContests(
    request: FilterContestRequest,
  ): Promise<{ count: number; entites: Contest[] }> {
    const order = {};

    order['expiredDate'] = request.pageOptions.order;

    const contests = await this.contestRepository.find({
      where: { active: true, status: request.status, isVisible: true },
      relations: { user: true, customerDrawings: true },
      order: order,
      skip: (request.pageOptions.page - 1) * request.pageOptions.take,
      take: request.pageOptions.take,
    });

    const entites = contests;
    const count = await this.contestRepository.count({
      where: { active: true, status: request.status },
    });

    return { count, entites };
  }

  async getContestsNotPagination(): Promise<Contest[]> {
    return await this.contestRepository.find({
      where: { active: true },
      relations: { user: true, customerDrawings: true },
    });
  }

  async getContestByStaffId(
    staffId: string,
    status: string,
  ): Promise<Contest[]> {
    return this.contestRepository.find({
      where: { user: { id: staffId }, active: true, status: status },
      relations: {
        user: true,
        customerDrawings: true,
        winners: {
          customerDrawing: true,
          promotion: true,
        },
      },
    });
  }

  async getContestByStaff(status: string): Promise<Contest[]> {
    return this.contestRepository.find({
      where: {
        user: {
          role: {
            name: NameRole.Staff,
          },
        },
        active: true,
        status: status,
      },
      relations: {
        user: true,
        customerDrawings: true,
        winners: {
          customerDrawing: true,
          promotion: true,
        },
      },
    });
  }

  async getContestsToDefineWinner(date: Date): Promise<Contest[]> {
    return this.contestRepository.find({
      where: {
        active: true,
        status: ContestStatus.EXPIRED,
        isPrized: false,
        expiredDate: LessThan(date),
      },
      relations: { user: true, customerDrawings: true },
    });
  }

  async removeContest(contest: Contest): Promise<void> {
    await this.contestRepository.remove(contest);
  }
}
