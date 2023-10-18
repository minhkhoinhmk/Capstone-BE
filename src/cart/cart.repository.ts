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

  async createCart(user: User) {
    return this.cartRepository.create({ user });
  }

  async saveCart(cart: Cart) {
    return this.cartRepository.save(cart);
  }

  async createAndSaveCart(user: User) {
    const cart = await this.createCart(user);
    return this.saveCart(cart);
  }

  async emptyCart(cart: Cart) {
    cart.cartItems = [];
    return await this.cartRepository.save(cart);
  }
}
