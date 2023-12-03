import { Contest } from 'src/contest/entity/contest.entity';
import { CustomerDrawing } from 'src/customer-drawing/entity/customer-drawing.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.votes, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => CustomerDrawing, (customerDrawing) => customerDrawing.votes)
  @JoinColumn({ name: 'customerDrawingId' })
  customerDrawing: CustomerDrawing;

  @ManyToOne(() => Learner, (learner) => learner.votes, { nullable: true })
  @JoinColumn({ name: 'learnerId' })
  learner: Learner;
}
