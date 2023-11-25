import { Expose } from 'class-transformer';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import { TransactionPayOff } from 'src/transaction-pay-off/entity/transaction-pay-off.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TransactionOrderDetail {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: true })
  @Expose()
  refundId: string;

  @Column({ nullable: true })
  @Expose()
  paymentAmount: number;

  @Column({ nullable: true })
  @Expose()
  refundAmount: number;

  @Column()
  @Expose()
  insertedDate: Date;

  @Column()
  @Expose()
  active: boolean;

  @ManyToOne(
    () => OrderDetail,
    (orderDetail) => orderDetail.transactionOrderDetails,
    { nullable: true },
  )
  @JoinColumn({ name: 'orderDetailId' })
  orderDetail: OrderDetail;

  @ManyToOne(
    () => TransactionPayOff,
    (transactionPayOff) => transactionPayOff.transactionOrderDetails,
    { nullable: true },
  )
  @JoinColumn({ name: 'transactionPayOffId' })
  transactionPayOff: TransactionPayOff;
}
