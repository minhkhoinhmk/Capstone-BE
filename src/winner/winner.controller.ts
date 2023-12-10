import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WinnerService } from './winner.service';
import { ViewWinnerReponse } from './dto/response/view-winner-reponse.entity';

@Controller('winner')
@ApiTags('Winner')
export class WinnerController {
  constructor(private readonly winnerService: WinnerService) {}

  @Get('contest/:id')
  async getWinners(@Param('id') id: string): Promise<ViewWinnerReponse[]> {
    return await this.winnerService.getWinnerByContestId(id);
  }
}
