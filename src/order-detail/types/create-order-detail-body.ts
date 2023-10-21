import { Course } from 'src/course/entity/course.entity';
import { Order } from 'src/order/entity/order.entity';
import { PromotionCourse } from 'src/promotion-course/entity/promotion-course.entity';

export type CreateOrderDetailBody = {
  order: Order;
  promotionCourse: PromotionCourse;
  course: Course;
  price: number;
  priceAfterPromotion: number;
  status: string | null;
  note: string | null;
  refundReason: string | null;
  active: boolean;
};
