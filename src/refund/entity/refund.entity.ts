import { Expose } from 'class-transformer';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  bank: string;

  @Column()
  @Expose()
  accountNumber: string;

  @Column()
  @Expose()
  refundPrice: number;

  @Column()
  @Expose()
  refundReason: string;

  @Column()
  @Expose()
  isApproved: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  @Expose()
  insertedDate: Date;

  @OneToOne(() => OrderDetail, (orderDetail) => orderDetail.refund)
  @JoinColumn({ name: 'orderDetailId' })
  @Expose()
  orderDetail: OrderDetail;
}
