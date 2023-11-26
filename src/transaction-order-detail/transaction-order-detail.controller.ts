import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionOrderDetailService } from './transaction-order-detail.service';
import { ViewTransactionOrderDetailResponse } from './dto/response/view-transaction-order-detail-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ApiTags } from '@nestjs/swagger';

@Controller('transaction-order-detail')
@ApiTags('Transaction-Order-Detail')
export class TransactionOrderDetailController {
  constructor(
    private readonly transactionOrderDetailService: TransactionOrderDetailService,
  ) {}

  @Get('/instructor/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  async getTransactionOrderDetailForInstructor(
    @Param('id') id: string,
  ): Promise<ViewTransactionOrderDetailResponse[]> {
    return this.transactionOrderDetailService.viewTransactionOrderDetail(id);
  }

  @Get('/transaction-pay-off/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  async getTransactionOrderDetailByTransacionPayOff(
    @Param('id') id: string,
  ): Promise<ViewTransactionOrderDetailResponse[]> {
    return this.transactionOrderDetailService.getTransactionOrderDetailByTransactionPayOff(
      id,
    );
  }
}
