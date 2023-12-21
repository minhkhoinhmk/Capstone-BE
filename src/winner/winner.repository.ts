import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Winner } from './entity/winner.entity';
import { Repository } from 'typeorm';
import { CustomerDrawing } from 'src/customer-drawing/entity/customer-drawing.entity';
import Promotion from 'src/promotion/entity/promotion.entity';
import { Contest } from 'src/contest/entity/contest.entity';

@Injectable()
export class WinnerRepository {
  constructor(
    @InjectRepository(Winner)
    private winnerRepository: Repository<Winner>,
  ) {}

  createWinner(
    position: number,
    customerDrawing: CustomerDrawing,
    promotion: Promotion,
    contest: Contest,
  ): Winner {
    return this.winnerRepository.create({
      position,
      active: false,
      customerDrawing,
      promotion,
      contest,
    });
  }

  async getWinnerByPostionAndContest(contestId: string, position: number) {
    return this.winnerRepository.findOne({
      where: { position, contest: { id: contestId } },
      relations: { promotion: true },
    });
  }

  async saveWinner(winner: Winner): Promise<void> {
    await this.winnerRepository.save(winner);
  }

  async getWinnerByContestId(contestId: string): Promise<Winner[]> {
    return await this.winnerRepository.find({
      where: { customerDrawing: { contest: { id: contestId } }, active: true },
      order: { position: 'ASC' },
      relations: {
        customerDrawing: { contest: true, user: true, votes: true },
        promotion: true,
      },
    });
  }

  async removeWinner(winner: Winner): Promise<void> {
    await this.winnerRepository.remove(winner);
  }
}
