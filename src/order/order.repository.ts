import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { User } from 'src/user/entity/user.entity';
import { CreateOrderBody } from './types/create-order-body';
import { OrderDetailRepository } from 'src/order-detail/order-detail.repository';
import { TransactionRepository } from 'src/transaction/transaction.repository';
import { NameOrderStatus } from './enum/name-order-status.enum';
import { GetOrderByUserRequest } from './dto/request/get-order-by-user.request.dto';
import { TransactionStatus } from 'src/transaction/enum/transaction.enum';

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
        orderDetails: { course: true, promotionCourse: true, refund: true },
        transaction: true,
      },
    });
  }

  async getOrdersByUser(
    body: GetOrderByUserRequest,
    user: User,
  ): Promise<{ count: number; entities: Order[] }> {
    const { orderStatus, pageOptions } = body;

    const entities = await this.orderRepository.find({
      where: {
        user,
        orderStatus: orderStatus ? orderStatus : undefined,
      },
      relations: {
        user: true,
        paymentMethod: true,
        orderDetails: { course: true },
      },
      order: {
        updatedDate: pageOptions.order,
      },
      skip: (pageOptions.page - 1) * pageOptions.take,
      take: pageOptions.take,
    });

    const count = await this.orderRepository.count({
      where: {
        user,
        orderStatus: orderStatus ? orderStatus : undefined,
      },
    });

    return { count: count, entities: entities };
  }

  async getCoursesByUserId(userId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: {
        user: { id: userId },
        active: true,
        orderStatus: NameOrderStatus.Success,
        transaction: {
          status: TransactionStatus.Success,
        },
      },
      relations: { orderDetails: { course: true, refund: true } },
    });
  }

  async getOrdersByOrderStatus(orderStatus: NameOrderStatus): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        orderStatus: orderStatus,
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

  async checkOrderExistedByUserAndCourse(
    courseId: string,
    userId: string,
  ): Promise<Order> {
    return this.orderRepository.findOne({
      where: {
        orderDetails: { course: { id: courseId }, active: true },
        user: { id: userId },
      },
      relations: {
        orderDetails: true,
      },
    });
  }
}
