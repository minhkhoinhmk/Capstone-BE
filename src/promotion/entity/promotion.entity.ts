import { ApiProperty } from '@nestjs/swagger';
import { PromotionCourse } from 'src/promotion-course/entity/promotion-course.entity';
import { User } from 'src/user/entity/user.entity';
import { Winner } from 'src/winner/entity/winner.entity';
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

  @Column({ nullable: true })
  title: string;

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

  @Column({ nullable: true })
  note: string;

  @ApiProperty({ type: Date, description: 'Effective date of the Promotion' })
  @Column({ nullable: true })
  effectiveDate: Date;

  @ApiProperty({ type: Date, description: 'Expire date of the Promotion' })
  @Column({ nullable: true })
  expiredDate: Date;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ nullable: true })
  amount: number;

  @Column()
  active: boolean;

  @OneToMany(
    () => PromotionCourse,
    (promotionCourse) => promotionCourse.promotion,
  )
  promotionCourses: PromotionCourse[];

  @OneToMany(() => Winner, (winner) => winner.promotion)
  winners: Winner[];

  @ManyToOne(() => User, (user) => user.promotions)
  @JoinColumn({ name: 'userId' })
  user: User;
}
