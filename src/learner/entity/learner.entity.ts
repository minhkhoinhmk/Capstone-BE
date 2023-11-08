import { CourseFeedback } from 'src/course-feedback/entity/course-feedbacl.entity';
import { LearnerCourse } from 'src/learner-course/entity/learner-course.entity';
import { Role } from 'src/role/entity/role.entity';
import { UserLecture } from 'src/user-lecture/entity/user-lecture.entity';
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
export class Learner {
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
  })
  userName: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  active: boolean;

  @Column()
  role: string;

  @OneToMany(() => CourseFeedback, (courseFeedback) => courseFeedback.learner)
  courseFeedbacks: CourseFeedback[];

  @OneToMany(() => LearnerCourse, (learnerCourse) => learnerCourse.learner)
  learnerCourses: LearnerCourse[];

  @OneToMany(() => UserLecture, (userLecture) => userLecture.learner)
  userLectures: UserLecture[];

  @ManyToOne(() => User, (user) => user.learners)
  @JoinColumn({ name: 'userId' })
  user: User;
}
