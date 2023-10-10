import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CartItem } from 'src/cart-item/entity/cart-item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: Date, description: 'Inserted date of the Cart' })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  insertedDate: Date;

  @ApiProperty({ type: Date, description: 'Updated date of the Cart' })
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @Exclude()
  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cartItems: CartItem[];
}
