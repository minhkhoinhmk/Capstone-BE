import { Injectable, Logger } from '@nestjs/common';
import { CreateTransactionRequest } from './dto/request/create-transaction.request.dto';
import { Order } from 'src/order/entity/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entity/transaction.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';

@Injectable()
export class TransactionRepository {
  private logger = new Logger('TransactionRepository', { timestamp: true });

  constructor(
    @InjectRepository(Transaction)
    private transactionlRepository: Repository<Transaction>,
  ) {}

  async createTransaction(
    createTrsanctionDto: CreateTransactionRequest,
    order: Order,
    status: string,
  ): Promise<Transaction> {
    return await this.transactionlRepository.create({
      paymentAmount: createTrsanctionDto.paymentAmount,
      bankCode: createTrsanctionDto.bankCode,
      bankTranNo: createTrsanctionDto.bankTranNo,
      cardType: createTrsanctionDto.cardType,
      order: order,
      status: status,
    });
  }

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    return await this.transactionlRepository.save(transaction);
  }

  async getTransactionByUserId(
    userId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ count: number; entites: Transaction[] }> {
    const transactions = await this.transactionlRepository.find({
      where: { order: { user: { id: userId } } },
      relations: { order: { user: true } },
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      take: pageOptionsDto.take,
    });

    const entites = transactions;
    const count = await this.transactionlRepository.count({
      where: { order: { user: { id: userId } } },
    });

    return { count, entites };
  }

  async getTransactionByTransactionId(
    transactionId: string,
  ): Promise<Transaction> {
    return await this.transactionlRepository.findOne({
      where: { id: transactionId },
      relations: { order: { user: true } },
    });
  }

  async removeTransaction(transaction: Transaction) {
    return await this.transactionlRepository.remove(transaction);
  }
}
