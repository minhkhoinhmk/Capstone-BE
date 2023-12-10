import { Expose } from 'class-transformer';
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
  @Expose()
  id: string;

  @Column()
  @Expose()
  title: string;

  @Column()
  @Expose()
  description: string;

  @Column({ nullable: true })
  @Expose()
  thumbnailUrl: string;

  @Column()
  @Expose()
  insertedDate: Date;

  @Column()
  @Expose()
  prize: string;

  @Column()
  @Expose()
  startedDate: Date;

  @Column()
  @Expose()
  expiredDate: Date;

  @Column({ nullable: true })
  @Expose()
  status: string;

  @Column()
  @Expose()
  active: boolean;

  @Column({ nullable: true })
  @Expose()
  isPrized: boolean;

  @ManyToOne(() => User, (user) => user.contests)
  @JoinColumn({ name: 'userId' })
  @Expose()
  user: User;

  @OneToMany(
    () => CustomerDrawing,
    (customerDrawing) => customerDrawing.contest,
  )
  @Expose()
  customerDrawings: CustomerDrawing[];
}
