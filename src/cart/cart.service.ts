import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  Scope,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { UserRepository } from 'src/user/user.repository';
import { AddCartItemRequest } from './dto/request/add-cart-item.dto';
import { CourseRepository } from 'src/course/course.repository';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { User } from 'src/user/entity/user.entity';
import { CartItemRepository } from 'src/cart-item/cart-item.repository';
import { CartItem } from 'src/cart-item/entity/cart-item.entity';
import { Cart } from './entity/cart.entity';

@Injectable({ scope: Scope.REQUEST })
export class CartService {
  private logger = new Logger('CartService', { timestamp: true });

  constructor(
    private cartRepository: CartRepository,
    private userRepository: UserRepository,
    private courseRepository: CourseRepository,
    private cartItemRepository: CartItemRepository,
    @Inject(REQUEST) private request: Request,
  ) {}

  async addCourseToCartItem(
    addCartItemRequest: AddCartItemRequest,
  ): Promise<void> {
    const { courseId, promotionCourseId } = addCartItemRequest;

    const customer = await this.getCustomerWithCart();

    const cart = await this.getOrCreateCart(customer);

    if (this.isCourseExistCartItem(courseId, customer.cart.cartItems)) {
      this.logger.error(
        `method=addCourseToCartItem, course is existing in cart item`,
      );
      throw new ConflictException('course is exsistent in cart item');
    }

    const course = await this.courseRepository.getCourseById(courseId);

    // Check can apply promotionCourseId

    const cartItem = await this.cartItemRepository.createCartItem({
      cart,
      course,
      promotionCourseId,
    });

    this.cartItemRepository.saveCartItem(cartItem);

    return;
  }

  async getCart() {
    const customer = await this.getCustomerWithCart();
    const cart = await this.getOrCreateCart(customer);
    cart.cartItems = cart.cartItems ? cart.cartItems : [];
    return cart;
  }

  async deleteCartItem(cartItemId: string) {
    const customer = await this.getCustomerWithCart();

    const cartItem = await this.cartItemRepository.getCartItemById(
      cartItemId,
      customer.cart,
    );

    if (!cartItem) {
      this.logger.error(`method=deleteCartItem, cartItemId is not existed`);
      throw new BadRequestException('cartItemId is not existed');
    }

    await this.cartItemRepository.deleteCartItem(cartItem);
    return;
  }

  async deleteAllCartItems() {
    const customer = await this.getCustomerWithCart();
    await this.cartRepository.emptyCart(customer.cart);
  }

  async getTotalPrice() {
    const customer = await this.getCustomerWithCart();
    return this.caculatePrice(customer.cart);
  }

  caculatePrice = (cart: Cart) => {
    let totalPrice = 0;
    let totalPriceDiscount = 0;
    let totalPriceAfterPromotion = 0;

    cart.cartItems.forEach(({ course, promotionCourse }) => {
      const currPrice = course.price;
      const discountPercent = promotionCourse
        ? promotionCourse.promotion.discountPercent
        : 0;
      const priceDiscount = (currPrice * discountPercent) / 100;
      totalPrice += currPrice;
      totalPriceAfterPromotion += currPrice - priceDiscount;
      totalPriceDiscount += priceDiscount;
    });

    return {
      totalPrice,
      totalPriceDiscount,
      totalPriceAfterPromotion,
    };
  };

  isCourseExistCartItem(courseId: string, cartItems: CartItem[]) {
    return cartItems.some((cartItem) => {
      return cartItem.course.id === courseId;
    });
  }

  getOrCreateCart = async (customer: User) =>
    !customer.cart ? this.cartRepository.saveCart(customer) : customer.cart;

  getCustomerWithCart = async () =>
    this.userRepository.getUserByIdWithRelation(
      (this.request['user'] as User).id,
      {
        cart: {
          cartItems: {
            course: true,
            promotionCourse: {
              promotion: true,
            },
          },
        },
      },
    );
}
