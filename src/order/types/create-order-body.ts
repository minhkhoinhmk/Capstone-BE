import { PaymentMethod } from 'src/payment-method/entity/payment-method.entity';
import { User } from 'src/user/entity/user.entity';
import { NameOrderStatus } from '../enum/name-order-status.enum';

export type CreateOrderBody = {
  user: User;
  totalPrice: number;
  totalPriceAfterPromotion: number;
  paymentMethod: PaymentMethod;
  orderStatus: NameOrderStatus;
  note: string;
  active: boolean;
  insertedDate: Date;
};
