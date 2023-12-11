import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { VoteService } from './vote.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { NameRole } from 'src/role/enum/name-role.enum';
import { HasRoles } from 'src/auth/roles.decorator';
import { User } from 'src/user/entity/user.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { Request } from 'express';

@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post('/customer-drawing/:customerDrawingId')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  createVoteCustomerDrawing(
    @Req() request: Request,
    @Param('customerDrawingId') customerDrawingId: string,
  ): Promise<void> {
    return this.voteService.voteCustomerDrawing(
      customerDrawingId,
      request['user'] as User | Learner,
    );
  }
}
