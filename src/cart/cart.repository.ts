import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class CartRepository {
  private logger = new Logger('CartRepository', { timestamp: true });

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async saveCart(user: User) {
    const cart = this.cartRepository.create({ user });
    return this.cartRepository.save(cart);
  }

  async emptyCart(cart: Cart) {
    cart.cartItems = [];
    return await this.cartRepository.save(cart);
  }
}
