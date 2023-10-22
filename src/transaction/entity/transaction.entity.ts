import { Order } from 'src/order/entity/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentAmount: number;

  @Column()
  bankCode: string;

  @Column()
  bankTranNo: string;

  @Column()
  cardType: string;

  @Column()
  @CreateDateColumn()
  insertedDate: Date;

  @Column()
  status: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
