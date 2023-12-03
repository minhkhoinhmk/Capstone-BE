import { Contest } from 'src/contest/entity/contest.entity';
import { User } from 'src/user/entity/user.entity';
import { Vote } from 'src/vote/entity/vote.entity';
import { Winner } from 'src/winner/entity/winner.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CustomerDrawing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @Column()
  insertedDate: Date;

  @Column()
  approved: boolean;

  @Column()
  active: boolean;

  @ManyToOne(() => User, (user) => user.customerDrawings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Contest, (contest) => contest.customerDrawings)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @OneToMany(() => Vote, (vote) => vote.customerDrawing)
  votes: Vote[];

  @OneToMany(() => Winner, (winner) => winner.customerDrawing)
  winners: Winner[];
}
