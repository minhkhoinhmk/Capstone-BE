import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionPayOff } from 'src/transaction-pay-off/entity/transaction-pay-off.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionPayOfflRepository {
  constructor(
    @InjectRepository(TransactionPayOff)
    private transactionPayOfflRepository: Repository<TransactionPayOff>,
  ) {}

  async createTransactionPayOff(
    senderId: string,
    totalPaymentAmount: number,
    user: User,
  ): Promise<TransactionPayOff> {
    return this.transactionPayOfflRepository.create({
      senderId: senderId,
      totalPaymentAmount: totalPaymentAmount,
      insertedDate: new Date(),
      active: true,
      user: user,
    });
  }

  async save(transactionPayOff: TransactionPayOff) {
    await this.transactionPayOfflRepository.save(transactionPayOff);
  }

  getTransactionPayOffById(
    transactionPayOffId: string,
  ): Promise<TransactionPayOff> {
    return this.transactionPayOfflRepository.findOne({
      where: { id: transactionPayOffId },
    });
  }

  getTransactionPayOff(instructorId: string): Promise<TransactionPayOff[]> {
    return this.transactionPayOfflRepository.find({
      where: { user: { id: instructorId } },
    });
  }
}