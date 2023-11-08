import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { User } from 'src/user/entity/user.entity';
import { PaymentMethod } from 'src/payment-method/entity/payment-method.entity';
import { CreateOrderBody } from './types/create-order-body';
import { NameOrderStatus } from 'src/order-status/enum/name-order-status.enum';
import { OrderStatus } from 'src/order-status/entity/order-status.entity';
import { OrderDetailRepository } from 'src/order-detail/order-detail.repository';
import { TransactionRepository } from 'src/transaction/transaction.repository';

@Injectable()
export class OrderRepository {
  private logger = new Logger('OrderRepository', { timestamp: true });

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderDetailRepository: OrderDetailRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  createOrder(body: CreateOrderBody) {
    return this.orderRepository.create(body);
  }

  async saveOrder(order: Order) {
    return this.orderRepository.save(order);
  }

  async getOrderById(orderId: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        user: true,
        paymentMethod: true,
        orderStatus: true,
        orderDetails: { course: true },
      },
    });
  }

  async getOrdersByUser(user: User): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user },
      relations: {
        user: true,
        paymentMethod: true,
        orderStatus: true,
        orderDetails: { course: true },
      },
    });
  }

  async getCoursesByUserId(userId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: {
        user: { id: userId },
        active: true,
        orderStatus: { statusName: NameOrderStatus.Success },
      },
      relations: { orderDetails: { course: true } },
    });
  }

  async getOrdersByOrderStatus(orderStatus: OrderStatus): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        orderStatus: { statusName: orderStatus.statusName },
      },
      relations: {
        orderDetails: true,
        transaction: true,
      },
    });
    return orders;
  }

  async removeOrder(order: Order) {
    const listPromises = [];
    order.orderDetails.forEach((orderDetail) =>
      listPromises.push(
        this.orderDetailRepository.removeOrderDetail(orderDetail),
      ),
    );

    await Promise.all(listPromises);

    if (order.transaction)
      await this.transactionRepository.removeTransaction(order.transaction);

    return this.orderRepository.remove(order);
  }
}
