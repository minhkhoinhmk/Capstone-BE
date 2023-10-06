import { Course } from 'src/course/entity/course.entity';
import Promotion from 'src/promotion/entity/promotion.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PromotionCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  effectiveDate: Date;

  @Column()
  expiredDate: Date;

  @Column()
  active: boolean;

  @ManyToOne(() => Promotion, (promotion) => promotion.promotionCourses)
  @JoinColumn({ name: 'promotionId' })
  promotion: Promotion;

  @ManyToOne(() => Course, (course) => course.promotionCourses)
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
