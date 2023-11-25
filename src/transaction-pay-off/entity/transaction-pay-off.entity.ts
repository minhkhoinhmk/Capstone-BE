import { Expose } from 'class-transformer';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import { TransactionOrderDetail } from 'src/transaction-order-detail/entity/transaction-order-detail.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TransactionPayOff {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: true })
  @Expose()
  senderId: string;

  @Column({ nullable: true })
  @Expose()
  totalPaymentAmount: number;

  @Column()
  @Expose()
  active: boolean;

  @Column()
  @Expose()
  insertedDate: Date;

  @ManyToOne(() => User, (user) => user.transactionPayOffs, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(
    () => TransactionOrderDetail,
    (transactionOrderDetail) => transactionOrderDetail.transactionPayOff,
    { nullable: true },
  )
  transactionOrderDetails: TransactionOrderDetail[];
}
