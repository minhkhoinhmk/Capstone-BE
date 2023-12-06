import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { Order } from './entity/order.entity';
import { OrderRepository } from './order.repository';
import { OrderController } from './order.controller';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/course/course.module';
import { CartItemModule } from 'src/cart-item/cart-item.module';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentMethodModule } from 'src/payment-method/payment-method.module';
import { CartModule } from 'src/cart/cart.module';
import { OrderDetailModule } from 'src/order-detail/order-detail.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { PromotionCourseModule } from 'src/promotion-course/promotion-course.module';

@Module({
  providers: [OrderService, OrderRepository],
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => AuthModule),
    UserModule,
    forwardRef(() => CourseModule),
    CartItemModule,
    PaymentMethodModule,
    CartModule,
    OrderDetailModule,
    TransactionModule,
    PromotionCourseModule,
    // forwardRef(() => TransactionModule),
  ],
  controllers: [OrderController],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
