import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
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
import { Exclude } from 'class-transformer';
import { Device } from 'src/device/entity/device.entity';
import { CourseReport } from 'src/course-report/entity/course-report.entity';
import { QuestionTopic } from 'src/question-topic/entity/question-topic.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 100,
  })
  firstName: string;

  @Column({
    length: 100,
  })
  lastName: string;

  @Column({
    length: 100,
  })
  middleName: string;

  @Column({
    length: 100,
    unique: true,
    nullable: true,
  })
  userName: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  phoneNumber: string;

  @Exclude()
  @Column({ nullable: true })
  status: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Exclude()
  @Column()
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
  orders: Course[];

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
}
