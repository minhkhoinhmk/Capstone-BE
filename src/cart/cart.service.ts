import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { UserRepository } from 'src/user/user.repository';
import { AddCartItemRequest } from './dto/request/add-cart-item.dto';
import { CourseRepository } from 'src/course/course.repository';
import { User } from 'src/user/entity/user.entity';
import { CartItemRepository } from 'src/cart-item/cart-item.repository';
import { CartItem } from 'src/cart-item/entity/cart-item.entity';
import { Cart } from './entity/cart.entity';
import { CourseService } from 'src/course/course.service';
import { dateInVietnam } from 'src/utils/date-vietnam.util';
import { CourseStatus } from 'src/course/type/enum/CourseStatus';

@Injectable()
export class CartService {
  private logger = new Logger('CartService', { timestamp: true });

  constructor(
    private cartRepository: CartRepository,
    private userRepository: UserRepository,
    private courseRepository: CourseRepository,
    private courseService: CourseService,
    private cartItemRepository: CartItemRepository,
  ) {}

  async addCourseToCartItem(
    addCartItemRequest: AddCartItemRequest,
    user: User,
  ): Promise<void> {
    const { courseId, promotionCourseId } = addCartItemRequest;

    const customer = await this.getCustomerWithCart(user);

    const cart = await this.getOrCreateCart(customer);

    const course = await this.courseRepository.getCourseById(courseId);

    if (!course || !course.active || course.status !== CourseStatus.APPROVED)
      throw new BadRequestException('Khóa học không tồn tại');

    if (this.isCourseExistCartItem(courseId, customer.cart.cartItems)) {
      this.logger.error(
        `method=addCourseToCartItem, course is existing in cart item`,
      );
      throw new ConflictException('Khóa học đã tồn tại trong giỏ hàng');
      // throw new ConflictException('course is exsistent in cart item');
    }

    // Check can apply promotionCourseId

    const cartItem = await this.cartItemRepository.createCartItem({
      cart,
      course,
      promotionCourseId,
    });

    await this.cartItemRepository.saveCartItem(cartItem);
  }

  async getCart(user: User) {
    const customer = await this.getCustomerWithCart(user);
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

  async deleteCartItem(cartItemId: string, user: User) {
    const customer = await this.getCustomerWithCart(user);

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

  async deleteAllCartItems(user: User) {
    const customer = await this.getCustomerWithCart(user);
    await this.cartRepository.emptyCart(customer.cart);
  }

  async getTotalPrice(user: User) {
    const customer = await this.getCustomerWithCart(user);
    return this.caculatePrice(customer.cart);
  }

  async checkCartIsValid(user: User) {
    const customer = await this.getCustomerWithCart(user);
    const messageErrors: string[] = [];

    customer.cart.cartItems = customer.cart.cartItems.filter((cartItem) => {
      const { course, promotionCourse } = cartItem;
      const isCourseValid =
        course.active && course.status === CourseStatus.APPROVED;

      if (!isCourseValid) {
        messageErrors.push(`Khóa học ${course.title} không còn hiệu lực`);
        return false;
      }

      if (!promotionCourse) return true;

      const date = dateInVietnam();
      const isPromotionCourseValid =
        promotionCourse.active &&
        promotionCourse.promotion.effectiveDate <= date &&
        promotionCourse.promotion.expiredDate >= date &&
        promotionCourse.promotion.active &&
        promotionCourse.used < promotionCourse.promotion.amount;

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

  getCustomerWithCart = async (user: User) =>
    this.userRepository.getUserByIdWithRelation(user.id, {
      cart: {
        cartItems: {
          course: {
            courseFeedbacks: true,
            chapterLectures: true,
            level: true,
            promotionCourses: {
              promotion: {
                user: { role: true },
              },
            },
            user: true,
          },
          promotionCourse: {
            promotion: true,
          },
        },
      },
    });
}
