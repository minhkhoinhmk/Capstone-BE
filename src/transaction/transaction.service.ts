import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { Transaction } from './entity/transaction.entity';
import { CreateTransactionRequest } from './dto/request/create-transaction.request.dto';
import { TransactionStatus } from './enum/transaction.enum';
import { OrderRepository } from 'src/order/order.repository';
import { CreateTrsanctionResponse } from './dto/response/create-transaction.reponse.dto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { FilterTrsanctionResponse } from './dto/response/filter-transaction.response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';

@Injectable()
export class TransactionService {
  private logger = new Logger('TransactionService', { timestamp: true });

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionRequest,
  ): Promise<CreateTrsanctionResponse> {
    const errorCodes: string[] = [
      '07',
      '09',
      '10',
      '11',
      '12',
      '13',
      '24',
      '51',
      '65',
      '75',
      '79',
      '99',
    ];
    let status: string;

    if (createTransactionDto.responseCode === '00') {
      status = TransactionStatus.Success;
    } else if (errorCodes.includes(createTransactionDto.responseCode)) {
      status = TransactionStatus.Fail;
    }

    const order = await this.orderRepository.getOrderById(
      createTransactionDto.orderId,
    );

    const transaction = await this.transactionRepository.createTransaction(
      createTransactionDto,
      order,
      status,
    );

    try {
      const result = await this.transactionRepository.saveTransaction(
        transaction,
      );

      const response = {
        id: result.id,
        orderId: result.order.id,
        paymentAmount: result.paymentAmount,
        bankTranNo: result.bankTranNo,
        cardType: result.cardType,
        insertedDate: result.insertedDate,
        status: result.status,
      };

      this.logger.log(
        `method=createTransaction, create transaction successfully`,
      );

      return response;
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(
          `method=createTransaction, Duplicate orderId=${createTransactionDto.orderId}`,
        );
        throw new ConflictException(
          `Duplicate orderId: ${createTransactionDto.orderId}`,
        );
      } else {
        this.logger.error(
          `method=createTransaction, message error=${error.message}`,
        );
        throw new ConflictException(
          `Duplicate orderId: ${createTransactionDto.orderId}`,
        );
      }
    }
  }

  async getTransactionsByUserId(
    userId: string,
    pageOption: PageOptionsDto,
  ): Promise<PageDto<FilterTrsanctionResponse>> {
    let transactions: Transaction[] = [];
    const responses: FilterTrsanctionResponse[] = [];

    const { count, entites } =
      await this.transactionRepository.getTransactionByUserId(
        userId,
        pageOption,
      );

    transactions = entites;

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
    });

    for (const transaction of transactions) {
      responses.push({
        id: transaction.id,
        orderId: transaction.order.id,
        paymentAmount: transaction.paymentAmount,
        bankTranNo: transaction.bankTranNo,
        cardType: transaction.cardType,
        insertedDate: transaction.insertedDate,
        status: transaction.status,
        userId: transaction.order.user.id,
        firstName: transaction.order.user.firstName,
        middleName: transaction.order.user.middleName,
        lastName: transaction.order.user.lastName,
      });
    }

    this.logger.log(
      `Method=getTransactionsByUserId, userId=${userId}, total=${transactions.length}`,
    );

    return new PageDto(responses, pageMetaDto);
  }

  async getTransactionByTransactionId(
    transactionId: string,
  ): Promise<FilterTrsanctionResponse> {
    const transaction =
      await this.transactionRepository.getTransactionByTransactionId(
        transactionId,
      );

    if (transaction) {
      this.logger.log(
        `Method=getTransactionByTransactionId, transactionId=${transactionId}`,
      );

      return {
        id: transaction.id,
        orderId: transaction.order.id,
        paymentAmount: transaction.paymentAmount,
        bankTranNo: transaction.bankTranNo,
        cardType: transaction.cardType,
        insertedDate: transaction.insertedDate,
        status: transaction.status,
        userId: transaction.order.user.id,
        firstName: transaction.order.user.firstName,
        middleName: transaction.order.user.middleName,
        lastName: transaction.order.user.lastName,
      };
    } else {
      this.logger.error(
        `Method=getTransactionByTransactionId, transactionId=${transactionId} not found`,
      );

      throw new NotFoundException(
        `Transaction with id ${transactionId} not found`,
      );
    }
  }
}
