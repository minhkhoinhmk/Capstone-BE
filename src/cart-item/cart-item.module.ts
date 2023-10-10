import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entity/cart-item.entity';
import { CartItemRepository } from './cart-item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem])],
  providers: [CartItemRepository],
  exports: [CartItemRepository],
})
export class CartItemModule {}
