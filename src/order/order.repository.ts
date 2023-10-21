import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { User } from 'src/user/entity/user.entity';
import { PaymentMethod } from 'src/payment-method/entity/payment-method.entity';
import { CreateOrderBody } from './types/create-order-body';

@Injectable()
export class OrderRepository {
  private logger = new Logger('OrderRepository', { timestamp: true });

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  createOrder(body: CreateOrderBody) {
    return this.orderRepository.create(body);
  }

  async saveOrder(order: Order) {
    return this.orderRepository.save(order);
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
