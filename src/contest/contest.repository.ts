import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contest } from './entity/contest.entity';
import { Repository } from 'typeorm';
import { CreateContestRequest } from './dto/request/create-contest-request.dto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';

@Injectable()
export class ContestRepository {
  constructor(
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
  ) {}

  async createContest(request: CreateContestRequest): Promise<Contest> {
    return this.contestRepository.create({
      title: request.title,
      description: request.description,
      thumbnailUrl: null,
      insertedDate: new Date(),
      prize: request.prize,
      startedDate: request.startedDate,
      expiredDate: request.expiredDate,
      active: true,
    });
  }

  async save(contest: Contest): Promise<Contest> {
    return await this.contestRepository.save(contest);
  }

  async getContestById(id: string): Promise<Contest> {
    return await this.contestRepository.findOne({
      where: { id: id, active: true },
      relations: { user: true, customerDrawings: true },
    });
  }

  async getContests(
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ count: number; entites: Contest[] }> {
    const contests = await this.contestRepository.find({
      where: { active: true },
      relations: { user: true, customerDrawings: true },
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      take: pageOptionsDto.take,
    });

    const entites = contests;
    const count = await this.contestRepository.count({
      where: { active: true },
    });

    return { count, entites };
  }

  async getContestByStaffId(staffId: string): Promise<Contest[]> {
    return this.contestRepository.find({
      where: { user: { id: staffId }, active: true },
      relations: { user: true, customerDrawings: true },
    });
  }
}
