import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { CourseRepository } from 'src/course/course.repository';
import { CartItemRepository } from 'src/cart-item/cart-item.repository';
import { CourseService } from 'src/course/course.service';

import { CartService } from 'src/cart/cart.service';
import { NamePaymentMethod } from 'src/payment-method/enum/name-payment-method.enum';
import { Order } from './entity/order.entity';
import { OrderRepository } from './order.repository';
import { OrderStatusRepository } from 'src/order-status/order-status.repository';
import { NameOrderStatus } from 'src/order-status/enum/name-order-status.enum';
import { PaymentMethodRepository } from 'src/payment-method/payment-method.repository';
import { OrderDetailRepository } from 'src/order-detail/order-detail.repository';
import { UpdateTransactionRequest } from './dto/request/update-order.request.dto';
import { User } from 'src/user/entity/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateTime, Interval } from 'luxon';

@Injectable()
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
  ) {}

  async createOrder(user: User): Promise<Order> {
    const customer = await this.cartService.getCustomerWithCart(user);
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
        insertedDate: new Date(),
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

  async updateOrder(body: UpdateTransactionRequest) {
    const order = await this.orderRepository.getOrderById(body.orderId);

    if (body.nameOrderStatus) {
      order.orderStatus = await this.orderStatusRepository.getOrderStatusByName(
        body.nameOrderStatus,
      );

      if (body.nameOrderStatus === NameOrderStatus.Success) {
        order.orderDetails.forEach((orderDetail) => {
          const totalBought = orderDetail.course.totalBought;
          orderDetail.course.totalBought = totalBought + 1;
          this.courseRepository.saveCourse(orderDetail.course);
        });
      }
    }

    return this.orderRepository.saveOrder(order);
  }

  async findOrdersByUser(user: User) {
    const orders = await this.orderRepository.getOrdersByUser(user);
    return orders;
  }

  // @Cron('0 0 * * *')
  @Cron(CronExpression.EVERY_30_SECONDS)
  async deletePedingOrder() {
    const ordersPending = await this.getOrdersPending();

    for (const order of ordersPending) {
      if (this.diffMinutes(order.insertedDate, new Date()) >= 30) {
        this.logger.log(
          `method=deletePedingOrder, remove order with id ${order.id}`,
        );
        await this.orderRepository.removeOrder(order);
      }
    }
  }

  diffMinutes(firstDate: Date, secondDate: Date) {
    const diffTimes = secondDate.getTime() - firstDate.getTime();
    return diffTimes / (1000 * 60);
  }

  async getOrdersPending(): Promise<Order[]> {
    const orderStatus = await this.orderStatusRepository.getOrderStatusByName(
      NameOrderStatus.Pending,
    );
    return this.orderRepository.getOrdersByOrderStatus(orderStatus);
  }
}
