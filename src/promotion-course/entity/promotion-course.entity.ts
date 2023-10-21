import { CartItem } from 'src/cart-item/entity/cart-item.entity';
import { Course } from 'src/course/entity/course.entity';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import Promotion from 'src/promotion/entity/promotion.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PromotionCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  effectiveDate: Date;

  @Column()
  expiredDate: Date;

  @Column()
  active: boolean;

  @Column({ unique: true })
  code: string;

  @ManyToOne(() => Promotion, (promotion) => promotion.promotionCourses)
  @JoinColumn({ name: 'promotionId' })
  promotion: Promotion;

  @ManyToOne(() => Course, (course) => course.promotionCourses)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => CartItem, (cartItem) => cartItem.promotionCourse)
  cartItems: CartItem[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.promotionCourse)
  orderDetails: OrderDetail[];
}
