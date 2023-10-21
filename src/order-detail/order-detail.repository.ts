import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entity/order-detail.entity';
import { CreateOrderDetailBody } from './types/create-order-detail-body';

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

  // async createAndSaveCart(user: User) {
  //   const cart = await this.createCart(user);
  //   return this.saveCart(cart);
  // }

  // async emptyCart(cart: Cart) {
  //   cart.cartItems = [];
  //   return await this.cartRepository.save(cart);
  // }
}
