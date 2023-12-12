import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entity/order-detail.entity';
import { CreateOrderDetailBody } from './types/create-order-detail-body';
import { NameOrderStatus } from 'src/order/enum/name-order-status.enum';
import { TransactionStatus } from 'src/transaction/enum/transaction.enum';

@Injectable()
export class OrderDetailRepository {
  private logger = new Logger('OrderDetailRepository', { timestamp: true });

  constructor(
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
  ) {}

  createOrderDetail(body: CreateOrderDetailBody) {
    return this.orderDetailRepository.create(body);
  }

  async saveOrderDetail(order: OrderDetail) {
    return this.orderDetailRepository.save(order);
  }

  async removeOrderDetail(orderDetail: OrderDetail) {
    return await this.orderDetailRepository.remove(orderDetail);
  }

  async getOrderDetailById(id: string) {
    return this.orderDetailRepository.findOne({
      where: { id: id },
      relations: {
        order: { user: true },
        course: true,
      },
    });
  }

  async getOrderDetailByInstructor(id: string) {
    return this.orderDetailRepository.find({
      where: {
        course: { user: { id } },
        isPaymentForInstructor: false,
        order: {
          orderStatus: NameOrderStatus.Success,
          transaction: { status: TransactionStatus.Success },
        },
      },
      relations: { course: { user: true }, order: { user: true } },
    });
  }

  async getRefundInOrderDetailByInstructor(id: string) {
    return this.orderDetailRepository.find({
      where: {
        course: { user: { id } },
        refund: { isStaffRefund: false, isApproved: true },
      },
      relations: {
        refund: true,
        course: { user: true },
        order: { user: true },
      },
    });
  }

  // async createAndSaveCart(user: User) {
  //   const cart = await this.createCart(user);
  //   return this.saveCart(cart);
  // }

  // async emptyCart(cart: Cart) {
  //   cart.cartItems = [];
  //   return await this.cartRepository.save(cart);
  // }
}
