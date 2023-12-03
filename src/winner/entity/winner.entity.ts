import { CustomerDrawing } from 'src/customer-drawing/entity/customer-drawing.entity';
import Promotion from 'src/promotion/entity/promotion.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Winner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  position: number;

  @Column()
  active: boolean;

  @ManyToOne(
    () => CustomerDrawing,
    (customerDrawing) => customerDrawing.winners,
  )
  @JoinColumn({ name: 'customerDrawingId' })
  customerDrawing: CustomerDrawing;

  @ManyToOne(() => Promotion, (promotion) => promotion.winners)
  @JoinColumn({ name: 'promotionId' })
  promotion: Promotion;
}
