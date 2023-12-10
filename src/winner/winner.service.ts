import { Injectable, Logger } from '@nestjs/common';
import { ContestRepository } from 'src/contest/contest.repository';
import { CustomerDrawingRepository } from 'src/customer-drawing/customer-drawing.repository';
import { CustomerDrawing } from 'src/customer-drawing/entity/customer-drawing.entity';
import { WinnerRepository } from './winner.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Winner } from './entity/winner.entity';
import { ViewWinnerReponse } from './dto/response/view-winner-reponse.entity';
import { WinnerMapper } from './mapper/winner.mapper';

@Injectable()
export class WinnerService {
  private logger = new Logger('WinnerService', { timestamp: true });

  constructor(
    private readonly customerDrawingRepository: CustomerDrawingRepository,
    private readonly contestRepository: ContestRepository,
    private readonly winnerRepository: WinnerRepository,
    private readonly mapper: WinnerMapper,
  ) {}

  //   @Cron(CronExpression.EVERY_5_MINUTES)
  async defineWinner(): Promise<void> {
    const contests = await this.contestRepository.getContestsToDefineWinner(
      new Date(),
    );

    for (const contest of contests) {
      const customerDrawings =
        await this.customerDrawingRepository.defineWinner(contest.id);
      for (const [i, customerDrawing] of customerDrawings.entries()) {
        const winner = await this.winnerRepository.createWinner(
          i + 1,
          customerDrawing,
          null,
        );

        await this.winnerRepository.saveWinner(winner);
      }

      contest.isPrized = true;
      await this.contestRepository.save(contest);

      this.logger.log(`Contest with ${contest.id} had been prized`);
    }
  }

  async getWinnerByContestId(contestId: string): Promise<ViewWinnerReponse[]> {
    const winners = await this.winnerRepository.getWinnerByContestId(contestId);
    let response: ViewWinnerReponse[] = [];

    for (const winner of winners) {
      const fullName = `${winner.customerDrawing.user.firstName} ${winner.customerDrawing.user.middleName} ${winner.customerDrawing.user.lastName}`;
      response.push(
        this.mapper.filterViewWinnerResponseFromWinner(winner, fullName),
      );
    }

    return response;
  }
}
