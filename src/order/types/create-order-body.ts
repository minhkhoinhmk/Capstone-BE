import { OrderStatus } from 'src/order-status/entity/order-status.entity';
import { PaymentMethod } from 'src/payment-method/entity/payment-method.entity';
import { User } from 'src/user/entity/user.entity';

export type CreateOrderBody = {
  user: User;
  totalPrice: number;
  totalPriceAfterPromotion: number;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  note: string;
  active: boolean;
  insertedDate: Date;
};
