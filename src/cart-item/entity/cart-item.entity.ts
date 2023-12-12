import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from 'src/course/entity/course.entity';
import { Cart } from 'src/cart/entity/cart.entity';
import { PromotionCourse } from 'src/promotion-course/entity/promotion-course.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne(() => Course, (course) => course.cartItems, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(
    () => PromotionCourse,
    (promotionCourse) => promotionCourse.cartItems,
    { nullable: true },
  )
  @JoinColumn({ name: 'promotionCourseId' })
  promotionCourse: PromotionCourse;
}
