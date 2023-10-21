import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'src/order/entity/order.entity';
import { NamePaymentMethod } from '../enum/name-payment-method.enum';

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    enum: NamePaymentMethod,
    description: 'name of the payment method',
  })
  @Column({ unique: true })
  name: NamePaymentMethod;

  @ApiProperty({
    type: Date,
    description: 'Inserted date of the payment method',
  })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  insertedDate: Date;

  @ApiProperty({ type: Boolean, description: 'Active of the payment method' })
  @Column()
  active: boolean;

  @OneToMany(() => Order, (order) => order.paymentMethod)
  orders: Order[];
}
