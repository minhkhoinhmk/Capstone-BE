import { ApiProperty } from '@nestjs/swagger';
import { PromotionCourse } from 'src/promotion-course/entity/promotion-course.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  discountPercent: number;

  @ApiProperty({ type: Date, description: 'Inserted date of the Promotion' })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  @Column()
  insertedDate: Date;

  @ApiProperty({ type: Date, description: 'Updated date of the Promotion' })
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
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

  @ManyToOne(() => User, (user) => user.promotions)
  @JoinColumn({ name: 'userId' })
  user: User;
}
