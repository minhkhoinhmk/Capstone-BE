import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { CartController } from './cart.controller';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/course/course.module';
import { CartItemModule } from 'src/cart-item/cart-item.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    forwardRef(() => AuthModule),
    UserModule,
    CourseModule,
    CartItemModule,
  ],
  providers: [CartService, CartRepository],
  controllers: [CartController],
  exports: [CartRepository],
})
export class CartModule {}
