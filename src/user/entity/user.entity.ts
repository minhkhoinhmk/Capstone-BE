import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from 'src/post/entity/post.entity';
import { Role } from 'src/role/entity/role.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { Course } from 'src/course/entity/course.entity';
import Promotion from 'src/promotion/entity/promotion.entity';
import { CourseFeedback } from 'src/course-feedback/entity/course-feedbacl.entity';
import { Cart } from 'src/cart/entity/cart.entity';
import { Order } from 'src/order/entity/order.entity';
import { UserLecture } from 'src/user-lecture/entity/user-lecture.entity';
import { Exclude, Expose } from 'class-transformer';
import { Device } from 'src/device/entity/device.entity';
import { CourseReport } from 'src/course-report/entity/course-report.entity';
import { QuestionTopic } from 'src/question-topic/entity/question-topic.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({
    length: 100,
  })
  @Expose()
  firstName: string;

  @Column({
    length: 100,
  })
  @Expose()
  lastName: string;

  @Column({
    length: 100,
  })
  @Expose()
  middleName: string;

  @Column({
    length: 100,
    unique: true,
    nullable: true,
  })
  @Expose()
  userName: string;

  @Exclude()
  @Column()
  @Expose()
  password: string;

  @Column({ nullable: true })
  @Expose()
  avatar: string;

  @Column()
  @Expose()
  phoneNumber: string;

  @Exclude()
  @Column({ nullable: true })
  @Expose()
  status: string;

  @Column({ unique: true, nullable: true })
  @Expose()
  email: string;

  @Exclude()
  @Column()
  @Expose()
  active: boolean;

  @Exclude()
  @Column({ nullable: true })
  otpCreatedDate: Date;

  @Exclude()
  @Column({ nullable: true })
  otp: string;

  @Exclude()
  @Column({ nullable: true })
  isConfirmedEmail: boolean;

  @Column({ nullable: true })
  @Expose()
  bank: string;

  @Column({ nullable: true })
  @Expose()
  accountNumber: string;

  @Column({ nullable: true })
  @Expose()
  reason: string;

  @Column({ nullable: true })
  @Expose()
  certificateUrl: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Learner, (learner) => learner.user)
  learners: Learner[];

  @OneToMany(() => Course, (course) => course.user)
  courses: Course[];

  @OneToMany(() => Promotion, (promotion) => promotion.user)
  promotions: Promotion[];

  @OneToMany(() => CourseFeedback, (courseFeedback) => courseFeedback.user)
  courseFeedbacks: CourseFeedback[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => CourseReport, (courseReport) => courseReport.user)
  courseReports: CourseReport[];

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToOne(() => Cart, (cart) => cart.user, { nullable: true })
  cart: Cart;

  @OneToMany(() => UserLecture, (userLecture) => userLecture.user)
  userLectures: UserLecture[];

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @OneToMany(() => QuestionTopic, (questionTopic) => questionTopic.user)
  questionTopics: QuestionTopic[];

  @OneToMany(() => Post, (post) => post.updatedBy)
  updatedPosts: Post[];
}
