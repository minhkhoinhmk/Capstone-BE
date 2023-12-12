import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart-item.entity';
import { Course } from 'src/course/entity/course.entity';
import { Cart } from 'src/cart/entity/cart.entity';

@Injectable()
export class CartItemRepository {
  private logger = new Logger('CartRepository', { timestamp: true });

  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async createCartItem({
    cart,
    course = null,
    promotionCourseId = null,
  }: {
    cart: Cart;
    course?: Course;
    promotionCourseId?: string;
  }) {
    return this.cartItemRepository.create({
      cart,
      course,
      promotionCourse: { id: promotionCourseId },
    });
  }

  async saveCartItem(cartItem: CartItem) {
    await this.cartItemRepository.save(cartItem);
  }

  async getCartItemById(id: string, cart: Cart) {
    return this.cartItemRepository.findOne({
      where: {
        id,
        cart: {
          id: cart.id,
        },
      },
    });
  }

  async deleteCartItem(cartItem: CartItem) {
    return this.cartItemRepository.remove(cartItem);
  }
}
