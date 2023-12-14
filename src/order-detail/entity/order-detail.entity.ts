import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from 'src/course/entity/course.entity';
import { PromotionCourse } from 'src/promotion-course/entity/promotion-course.entity';
import { Order } from 'src/order/entity/order.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Refund } from 'src/refund/entity/refund.entity';
import { TransactionOrderDetail } from 'src/transaction-order-detail/entity/transaction-order-detail.entity';

@Entity()
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: Number, description: 'Price of the order detail' })
  @Column()
  price: number;

  @ApiProperty({
    type: Number,
    description: 'Price after promotion of the order detail',
  })
  @Column()
  priceAfterPromotion: number;

  @ApiProperty({ type: String, description: 'Status of the order detail' })
  @Column({ nullable: true })
  status: string | null;

  @ApiProperty({ type: String, description: 'Note of the order detail' })
  @Column({ nullable: true })
  note: string | null;

  @ApiProperty({ type: Boolean, description: 'Active of the order detail' })
  @Column()
  active: boolean;

  @ApiProperty({ type: Boolean, description: 'Is payed for instructor' })
  @Column({ default: false })
  isPaymentForInstructor: boolean;

  @ManyToOne(() => Order, (order) => order.orderDetails)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Course, (course) => course.cartItems, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;

  @ManyToOne(
    () => PromotionCourse,
    (promotionCourse) => promotionCourse.orderDetails,
    { nullable: true },
  )
  @JoinColumn({ name: 'promotionCourseId' })
  promotionCourse: PromotionCourse | null;

  @OneToOne(() => Refund, (refund) => refund.orderDetail)
  refund: Refund;

  @OneToMany(
    () => TransactionOrderDetail,
    (transactionOrderDetail) => transactionOrderDetail.orderDetail,
    { nullable: true },
  )
  transactionOrderDetails: TransactionOrderDetail[];
}
