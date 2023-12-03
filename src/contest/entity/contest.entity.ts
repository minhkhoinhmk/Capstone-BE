import { CustomerDrawing } from 'src/customer-drawing/entity/customer-drawing.entity';
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
export class Contest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column()
  insertedDate: Date;

  @Column()
  prize: string;

  @Column()
  startedDate: Date;

  @Column()
  expiredDate: Date;

  @Column()
  active: boolean;

  @ManyToOne(() => User, (user) => user.contests)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => CustomerDrawing, (customerDrawing) => customerDrawing.user)
  customerDrawings: CustomerDrawing[];
}
