import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { CourseRepository } from 'src/course/course.repository';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { CartItemRepository } from 'src/cart-item/cart-item.repository';
import { CourseService } from 'src/course/course.service';

import { CartRepository } from 'src/cart/cart.repository';
import { CartService } from 'src/cart/cart.service';
import { NamePaymentMethod } from 'src/payment-method/enum/name-payment-method.enum';
import { Order } from './entity/order.entity';
import { OrderRepository } from './order.repository';
import { OrderStatusRepository } from 'src/order-status/order-status.repository';
import { NameOrderStatus } from 'src/order-status/enum/name-order-status.enum';
import { PaymentMethodRepository } from 'src/payment-method/payment-method.repository';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import { CreateOrderDetailBody } from 'src/order-detail/types/create-order-detail-body';
import { OrderDetailRepository } from 'src/order-detail/order-detail.repository';

@Injectable({ scope: Scope.REQUEST })
export class OrderService {
  private logger = new Logger('OrderService', { timestamp: true });

  constructor(
    private orderRepository: OrderRepository,
    private orderDetailRepository: OrderDetailRepository,
    // private cartRepository: CartRepository,
    private cartService: CartService,
    private userRepository: UserRepository,
    private courseRepository: CourseRepository,
    private courseService: CourseService,
    private cartItemRepository: CartItemRepository,
    private paymentMethodRepository: PaymentMethodRepository,
    private orderStatusRepository: OrderStatusRepository,
    @Inject(REQUEST) private request: Request,
  ) {}

  async createOrder(): Promise<Order> {
    const customer = await this.cartService.getCustomerWithCart();
    const caculatePrice = this.cartService.caculatePrice(customer.cart);
    const orderStatus = await this.orderStatusRepository.getOrderStatusByName(
      NameOrderStatus.Pending,
    );
    const paymentMethod =
      await this.paymentMethodRepository.getPaymentMethodByName(
        NamePaymentMethod.VNPAY,
      );

    // Handle order
    const order = await this.orderRepository.saveOrder(
      this.orderRepository.createOrder({
        user: customer,
        totalPrice: caculatePrice.totalPrice,
        totalPriceAfterPromotion: caculatePrice.totalPriceAfterPromotion,
        paymentMethod,
        orderStatus,
        note: '',
        active: true,
      }),
    );

    // Handle order details
    const arrayOfPromises = [];
    customer.cart.cartItems.forEach((cartItem) => {
      const price = cartItem.course.price;
      const discount = cartItem.promotionCourse
        ? cartItem.promotionCourse.promotion.discountPercent
        : 0;
      const priceAfterPromotion = price - (price * discount) / 100;

      arrayOfPromises.push(
        this.orderDetailRepository.saveOrderDetail(
          this.orderDetailRepository.createOrderDetail({
            order,
            promotionCourse: cartItem.promotionCourse,
            course: cartItem.course,
            price,
            priceAfterPromotion,
            status: null,
            note: null,
            refundReason: null,
            active: true,
          }),
        ),
      );
    });
    const orderDetails = await Promise.all(arrayOfPromises);
    order.orderDetails = orderDetails;

    return order;
  }
}
