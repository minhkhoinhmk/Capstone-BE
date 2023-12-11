import { Expose } from 'class-transformer';
import { Contest } from 'src/contest/entity/contest.entity';
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
  @Expose()
  id: string;

  @Column()
  @Expose()
  position: number;

  @Column()
  @Expose()
  active: boolean;

  @ManyToOne(
    () => CustomerDrawing,
    (customerDrawing) => customerDrawing.winners,
  )
  @JoinColumn({ name: 'customerDrawingId' })
  @Expose()
  customerDrawing: CustomerDrawing;

  @ManyToOne(() => Promotion, (promotion) => promotion.winners)
  @JoinColumn({ name: 'promotionId' })
  @Expose()
  promotion: Promotion;

  @ManyToOne(() => Contest, (contest) => contest.winners)
  @JoinColumn({ name: 'contestId' })
  @Expose()
  contest: Contest;
}
