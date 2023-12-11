import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WinnerService } from './winner.service';
import { ViewWinnerReponse } from './dto/response/view-winner-reponse.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { DefinePromotionForWinnerRequest } from './dto/request/define-promotion-for-winner.request.dto';
import { Request } from 'express';
import { User } from 'src/user/entity/user.entity';

@Controller('winner')
@ApiTags('Winner')
export class WinnerController {
  constructor(private readonly winnerService: WinnerService) {}

  @Get('contest/:id')
  async getWinners(@Param('id') id: string): Promise<ViewWinnerReponse[]> {
    return await this.winnerService.getWinnerByContestId(id);
  }

  @Post(':contestId')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  @HttpCode(201)
  async definePromotionForWinner(
    @Body() body: DefinePromotionForWinnerRequest,
    @Req() request: Request,
    @Param('contestId') contestId: string,
  ): Promise<void> {
    return await this.winnerService.definePromotionForWinner(
      body,
      contestId,
      request['user'] as User,
    );
  }
}
