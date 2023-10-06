import { PromotionCourse } from 'src/promotion-course/entity/promotion-course.entity';
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
export default class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  discountPercent: number;

  @Column()
  insertedDate: Date;

  @Column()
  updatedDate: Date;

  @Column()
  note: string;

  @Column()
  active: boolean;

  @OneToMany(
    () => PromotionCourse,
    (promotionCourse) => promotionCourse.promotion,
  )
  promotionCourses: PromotionCourse[];

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'userId' })
  user: User;
}
