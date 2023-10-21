import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from './entity/order-status.entity';
import { NameOrderStatus } from './enum/name-order-status.enum';

@Injectable()
export class OrderStatusRepository {
  private logger = new Logger('OrderStatusRepository', { timestamp: true });

  constructor(
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>,
  ) {}

  async getOrderStatusByName(name: NameOrderStatus): Promise<OrderStatus> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: { statusName: name },
    });
    return orderStatus;
  }
}
