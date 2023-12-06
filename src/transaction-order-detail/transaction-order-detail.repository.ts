import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import { TransactionPayOff } from 'src/transaction-pay-off/entity/transaction-pay-off.entity';
import { Repository } from 'typeorm';
import { TransactionOrderDetail } from './entity/transaction-order-detail.entity';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

@Injectable()
export class TransactionOrderDetailRepository {
  constructor(
    @InjectRepository(TransactionOrderDetail)
    private transactionOrderDetailRepository: Repository<TransactionOrderDetail>,
  ) {}

  async createTransactionOrderDetail(
    orderDetail: OrderDetail,
    transactionPayOff: TransactionPayOff,
  ): Promise<TransactionOrderDetail> {
    return this.transactionOrderDetailRepository.create({
      refundId: orderDetail.refund ? orderDetail.refund.id : null,
      paymentAmount: orderDetail.refund
        ? 0
        : orderDetail.priceAfterPromotion * 0.8,
      refundAmount: orderDetail.refund
        ? orderDetail.refund.refundPrice * 0.8
        : 0,
      insertedDate: dateInVietnam(),
      active: true,
      orderDetail: orderDetail,
      transactionPayOff: transactionPayOff,
    });
  }

  async save(transactionOrderDetail: TransactionOrderDetail) {
    await this.transactionOrderDetailRepository.save(transactionOrderDetail);
  }

  async getTransactionOrderDetailsByTransactionPayOff(
    transactionPayOffId: string,
  ): Promise<TransactionOrderDetail[]> {
    return await this.transactionOrderDetailRepository.find({
      where: {
        transactionPayOff: { id: transactionPayOffId },
      },
      relations: {
        orderDetail: { course: { user: true }, order: { user: true } },
      },
    });
  }
}
