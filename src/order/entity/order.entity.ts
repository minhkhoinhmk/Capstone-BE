import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { PaymentMethod } from 'src/payment-method/entity/payment-method.entity';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { OrderStatus } from 'src/order-status/entity/order-status.entity';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: Number, description: 'Total price of the order' })
  @Column()
  totalPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Total price after promotion of the order',
  })
  @Column()
  totalPriceAfterPromotion: number;

  @ApiProperty({ type: Date, description: 'Inserted date of the Order' })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  insertedDate: Date;

  @ApiProperty({ type: Date, description: 'Updated date of the Order' })
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @ApiProperty({ type: String, description: 'Note of the order' })
  @Column()
  note: string;

  @ApiProperty({ type: Boolean, description: 'Active of the Order' })
  @Column()
  active: boolean;

  @Exclude()
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => PaymentMethod, (paymetnMethod) => paymetnMethod.orders)
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => OrderStatus, (orderStatus) => orderStatus.orders)
  @JoinColumn({ name: 'orderStatusId' })
  orderStatus: OrderStatus;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @OneToOne(() => Transaction, (transaction) => transaction.order)
  transaction: Transaction;
}
