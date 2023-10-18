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
import { CourseService } from 'src/course/course.service';
import { Course } from 'src/course/entity/course.entity';

@Injectable({ scope: Scope.REQUEST })
export class CartService {
  private logger = new Logger('CartService', { timestamp: true });

  constructor(
    private cartRepository: CartRepository,
    private userRepository: UserRepository,
    private courseRepository: CourseRepository,
    private courseService: CourseService,
    private cartItemRepository: CartItemRepository,
    @Inject(REQUEST) private request: Request,
  ) {}

  async addCourseToCartItem(
    addCartItemRequest: AddCartItemRequest,
  ): Promise<void> {
    const { courseId, promotionCourseId } = addCartItemRequest;

    const customer = await this.getCustomerWithCart();

    const cart = await this.getOrCreateCart(customer);

    const course = await this.courseRepository.getCourseById(courseId);

    if (!course || !course.active)
      throw new BadRequestException('Course is not existing');

    if (this.isCourseExistCartItem(courseId, customer.cart.cartItems)) {
      this.logger.error(
        `method=addCourseToCartItem, course is existing in cart item`,
      );
      throw new ConflictException('course is exsistent in cart item');
    }

    // Check can apply promotionCourseId

    const cartItem = await this.cartItemRepository.createCartItem({
      cart,
      course,
      promotionCourseId,
    });

    await this.cartItemRepository.saveCartItem(cartItem);

    return;
  }

  async getCart() {
    const customer = await this.getCustomerWithCart();
    const cart = await this.getOrCreateCart(customer);
    cart.cartItems = cart.cartItems ? cart.cartItems : [];

    cart.cartItems.forEach((cartItem) => {
      const responseCourse: any = this.courseService.configCourseResponse(
        cartItem.course,
      );
      if (cartItem.promotionCourse) {
        const discountPercent =
          cartItem.promotionCourse.promotion.discountPercent;
        responseCourse.discount = discountPercent;
        responseCourse.discountPrice =
          responseCourse.price - discountPercent * responseCourse.price;
      } else {
        responseCourse.discount = 0;
        responseCourse.discountPrice = responseCourse.price;
      }
      cartItem.course = responseCourse;
    });
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

  async checkCartIsValid() {
    const customer = await this.getCustomerWithCart();
    const messageErrors: string[] = [];

    customer.cart.cartItems = customer.cart.cartItems.filter((cartItem) => {
      const { course, promotionCourse, combo } = cartItem;
      const isCourseValid = course.active;

      if (!isCourseValid) {
        messageErrors.push(`Khóa học ${course.title} không còn hiệu lực`);
        return false;
      }

      if (!promotionCourse) return true;

      const date = new Date();
      const isPromotionCourseValid =
        promotionCourse.active &&
        promotionCourse.effectiveDate <= date &&
        promotionCourse.expiredDate >= date &&
        promotionCourse.promotion.active;

      if (!isPromotionCourseValid) {
        cartItem.promotionCourse = null;
        this.cartItemRepository.saveCartItem(cartItem);
        messageErrors.push(
          `Mã giảm giá cho khóa học ${course.title} không còn hiệu lực`,
        );
      }

      return true;
    });

    if (messageErrors.length > 0) {
      await this.cartRepository.saveCart(customer.cart);
    }
    return messageErrors;
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
    !customer.cart
      ? this.cartRepository.createAndSaveCart(customer)
      : customer.cart;

  getCustomerWithCart = async () =>
    this.userRepository.getUserByIdWithRelation(
      (this.request['user'] as User).id,
      {
        cart: {
          cartItems: {
            course: {
              courseFeedbacks: true,
              chapterLectures: true,
              level: true,
              promotionCourses: {
                promotion: {
                  user: { roles: true },
                },
              },
              user: true,
            },
            promotionCourse: {
              promotion: true,
            },
          },
        },
      },
    );
}
