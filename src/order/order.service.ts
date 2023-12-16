import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { CourseRepository } from 'src/course/course.repository';
import { CartItemRepository } from 'src/cart-item/cart-item.repository';
import { CourseService } from 'src/course/course.service';

import { CartService } from 'src/cart/cart.service';
import { NamePaymentMethod } from 'src/payment-method/enum/name-payment-method.enum';
import { Order } from './entity/order.entity';
import { OrderRepository } from './order.repository';
import { PaymentMethodRepository } from 'src/payment-method/payment-method.repository';
import { OrderDetailRepository } from 'src/order-detail/order-detail.repository';
import { UpdateTransactionRequest } from './dto/request/update-order.request.dto';
import { User } from 'src/user/entity/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NameOrderStatus } from './enum/name-order-status.enum';
import { dateInVietnam } from 'src/utils/date-vietnam.util';
import { GetOrderByUserRequest } from './dto/request/get-order-by-user.request.dto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PromotionCourseRepository } from 'src/promotion-course/promotion-course.repository';

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
    private promotionCourseRepository: PromotionCourseRepository,
  ) {}

  async createOrder(user: User): Promise<Order> {
    const customer = await this.cartService.getCustomerWithCart(user);
    const caculatePrice = this.cartService.caculatePrice(customer.cart);
    const orderStatus = NameOrderStatus.Pending;
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
        insertedDate: dateInVietnam(),
      }),
    );

    // Handle order details
    const arrayOfPromises = [];
    const arrayOfPromises2 = [];
    customer.cart.cartItems.forEach((cartItem) => {
      const price = cartItem.course.price;
      const discount = cartItem.promotionCourse
        ? cartItem.promotionCourse.promotion.discountPercent
        : 0;
      const priceAfterPromotion = price - (price * discount) / 100;

      if (cartItem.promotionCourse) {
        cartItem.promotionCourse.used = cartItem.promotionCourse.used + 1;
        arrayOfPromises2.push(
          this.promotionCourseRepository.savePromotionCourse(
            cartItem.promotionCourse,
          ),
        );
      }

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
    await Promise.all(arrayOfPromises2);
    order.orderDetails = orderDetails;

    return order;
  }

  async updateOrder(body: UpdateTransactionRequest) {
    const order = await this.orderRepository.getOrderById(body.orderId);

    if (body.nameOrderStatus) {
      order.orderStatus = body.nameOrderStatus;

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

  async findOrdersByUser(
    body: GetOrderByUserRequest,
    user: User,
  ): Promise<PageDto<Order>> {
    const { count, entities } = await this.orderRepository.getOrdersByUser(
      body,
      user,
    );

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: body.pageOptions,
    });

    this.logger.log(`method=findOrdersByUser, totalItems=${count}`);

    return new PageDto(entities, pageMetaDto);
  }

  async findOrderByOrderId(orderId: string, user: User) {
    const order = await this.orderRepository.getOrderById(orderId);
    return order;
  }

  // @Cron('0 0 * * *')
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deletePedingOrder() {
    const ordersPending = await this.getOrdersPending();

    for (const order of ordersPending) {
      if (this.diffMinutes(order.insertedDate, dateInVietnam()) >= 30) {
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
    return this.orderRepository.getOrdersByOrderStatus(NameOrderStatus.Pending);
  }
}
