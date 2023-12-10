import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Winner } from './entity/winner.entity';
import { Repository } from 'typeorm';
import { CustomerDrawing } from 'src/customer-drawing/entity/customer-drawing.entity';
import Promotion from 'src/promotion/entity/promotion.entity';

@Injectable()
export class WinnerRepository {
  constructor(
    @InjectRepository(Winner)
    private winnerRepository: Repository<Winner>,
  ) {}

  async createWinner(
    position: number,
    customerDrawing: CustomerDrawing,
    promotion: Promotion,
  ): Promise<Winner> {
    return this.winnerRepository.create({
      position,
      active: true,
      customerDrawing,
      promotion,
    });
  }

  async saveWinner(winner: Winner): Promise<void> {
    await this.winnerRepository.save(winner);
  }

  async getWinnerByContestId(contestId: string): Promise<Winner[]> {
    return await this.winnerRepository.find({
      where: { customerDrawing: { contest: { id: contestId } }, active: true },
      relations: {
        customerDrawing: { contest: true, user: true },
        promotion: true,
      },
    });
  }
}