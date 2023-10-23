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
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  shortDescription: string;

  @Column()
  prepareMaterial: string;

  @Column()
  status: string;

  @Column()
  totalChapter: number;

  @Column()
  publishedDate: Date;

  @Column()
  totalBought: number;

  @Column()
  thumbnailUrl: string;

  @Column()
  active: boolean;

  @OneToMany(() => PromotionCourse, (promotionCourse) => promotionCourse.course)
  promotionCourses: PromotionCourse[];

  @OneToMany(() => CourseFeedback, (courseFeedback) => courseFeedback.course)
  courseFeedbacks: CourseFeedback[];

  @OneToMany(() => ChapterLecture, (chapterLecture) => chapterLecture.course)
  chapterLectures: ChapterLecture[];

  @OneToMany(() => LearnerCourse, (learnerCourse) => learnerCourse.learner)
  learnerCourses: LearnerCourse[];

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'instructorId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Level, (level) => level.courses)
  @JoinColumn({ name: 'levelId' })
  level: Level;

  @ManyToMany(() => Combo, (combos) => combos.courses)
  combos: Combo[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.course)
  cartItems: CartItem[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.course)
  orderDetails: OrderDetail[];
}
