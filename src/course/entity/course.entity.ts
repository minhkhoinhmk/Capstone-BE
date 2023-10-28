import { Expose } from 'class-transformer';
import { CartItem } from 'src/cart-item/entity/cart-item.entity';
import { Category } from 'src/category/entity/category.entity';
import { ChapterLecture } from 'src/chapter-lecture/entity/chapter-lecture.entity';
import { Combo } from 'src/combo/entity/combo.entity';
import { CourseFeedback } from 'src/course-feedback/entity/course-feedbacl.entity';
import { LearnerCourse } from 'src/learner-course/entity/learner-course.entity';
import Level from 'src/level/entity/level.entity';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import { PromotionCourse } from 'src/promotion-course/entity/promotion-course.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  title: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  price: number;

  @Column()
  @Expose()
  shortDescription: string;

  @Column()
  @Expose()
  prepareMaterial: string;

  @Column()
  @Expose()
  status: string;

  @Column()
  @Expose()
  totalChapter: number;

  @Column()
  @Expose()
  publishedDate: Date;

  @Column()
  @Expose()
  totalBought: number;

  @Column()
  @Expose()
  thumbnailUrl: string;

  @Column()
  @Expose()
  active: boolean;

  @OneToMany(() => PromotionCourse, (promotionCourse) => promotionCourse.course)
  @Expose()
  promotionCourses: PromotionCourse[];

  @OneToMany(() => CourseFeedback, (courseFeedback) => courseFeedback.course)
  @Expose()
  courseFeedbacks: CourseFeedback[];

  @OneToMany(() => ChapterLecture, (chapterLecture) => chapterLecture.course)
  @Expose()
  chapterLectures: ChapterLecture[];

  @OneToMany(() => LearnerCourse, (learnerCourse) => learnerCourse.learner)
  @Expose()
  learnerCourses: LearnerCourse[];

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'instructorId' })
  @Expose()
  user: User;

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'categoryId' })
  @Expose()
  category: Category;

  @ManyToOne(() => Level, (level) => level.courses)
  @JoinColumn({ name: 'levelId' })
  @Expose()
  level: Level;

  @ManyToMany(() => Combo, (combos) => combos.courses)
  @Expose()
  combos: Combo[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.course)
  @Expose()
  cartItems: CartItem[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.course)
  @Expose()
  orderDetails: OrderDetail[];
}
