import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'src/order/entity/order.entity';
import { NameOrderStatus } from '../enum/name-order-status.enum';

@Entity()
export class OrderStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: NameOrderStatus, description: 'status order name' })
  @Column({ unique: true })
  statusName: NameOrderStatus;

  @ApiProperty({ type: Date, description: 'Inserted date of the status' })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  insertedDate: Date;

  @ApiProperty({ type: Boolean, description: 'Active of the status' })
  @Column()
  active: boolean;

  @OneToMany(() => Order, (order) => order.orderStatus)
  orders: Order[];
}
