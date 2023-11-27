import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionPayOffService } from './transaction-pay-off.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ViewTransactionPayOffResponse } from './dto/response/view-transaction-pay-off-response.dto';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('transaction-pay-off')
@ApiTags('Transaction-Pay-Off')
export class TransactionPayOffController {
  constructor(
    private readonly transactionPayOffService: TransactionPayOffService,
  ) {}

  @Post('/payment/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  async createTractionPayOff(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<void> {
    return this.transactionPayOffService.createTransactionPayOff(
      id,
      req['user']['id'],
    );
  }

  @Get()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  async getTransactionPayOffsByRecieve(
    @Req() req: Request,
  ): Promise<ViewTransactionPayOffResponse[]> {
    return this.transactionPayOffService.getTransactionPayOffByReciever(
      req['user']['id'],
    );
  }

  @Get()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  async getTransactionPayOffsBySender(
    @Req() req: Request,
  ): Promise<ViewTransactionPayOffResponse[]> {
    return this.transactionPayOffService.getTransactionPayOffBySender(
      req['user']['id'],
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor, NameRole.Admin)
  async getTransactionPayOffById(
    @Param('id') id: string,
  ): Promise<ViewTransactionPayOffResponse> {
    return this.transactionPayOffService.getTransactionPayOffById(id);
  }
}
