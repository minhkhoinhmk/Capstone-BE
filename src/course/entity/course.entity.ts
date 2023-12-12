import { Expose } from 'class-transformer';
import { CartItem } from 'src/cart-item/entity/cart-item.entity';
import { Category } from 'src/category/entity/category.entity';
import { ChapterLecture } from 'src/chapter-lecture/entity/chapter-lecture.entity';
import { CourseFeedback } from 'src/course-feedback/entity/course-feedbacl.entity';
import { CourseReport } from 'src/course-report/entity/course-report.entity';
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
  UpdateDateColumn,
} from 'typeorm';
import { CourseStatus } from '../type/enum/CourseStatus';
import { Achievement } from 'src/achievement/entity/achievement.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: true })
  @Expose()
  title: string;

  @Column({ nullable: true })
  @Expose()
  description: string;

  @Column({ nullable: true })
  @Expose()
  price: number;

  @Column({ nullable: true })
  @Expose()
  shortDescription: string;

  @Column({ nullable: true })
  @Expose()
  prepareMaterial: string;

  @Column({ nullable: true })
  @Expose()
  status: CourseStatus;

  @Column({ nullable: true })
  @Expose()
  totalChapter: number;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  @Expose()
  publishedDate: Date;

  @Column({ nullable: true })
  @Expose()
  totalBought: number;

  @Column({ nullable: true })
  @Expose()
  thumbnailUrl: string;

  @Column({ nullable: true })
  @Expose()
  active: boolean;

  @Column({ nullable: true })
  @Expose()
  reason: string;

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

  @OneToMany(() => CourseReport, (courseReport) => courseReport.course)
  @Expose()
  courseReports: CourseReport[];

  @OneToMany(() => Achievement, (achievement) => achievement.course)
  @Expose()
  achievements: Achievement[];

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

  @OneToMany(() => CartItem, (cartItem) => cartItem.course)
  @Expose()
  cartItems: CartItem[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.course)
  @Expose()
  orderDetails: OrderDetail[];
}
