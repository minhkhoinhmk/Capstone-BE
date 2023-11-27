import { Course } from 'src/course/entity/course.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CourseFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ratedStar: number;

  @Column()
  description: string;

  @Column()
  insertedDate: Date;

  @Column()
  insertedBy: string;

  @Column()
  updatedDate: Date;

  @Column()
  updatedBy: string;

  @Column()
  active: boolean;

  @ManyToOne(() => User, (user) => user.courseFeedbacks, {
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Course, (course) => course.courseFeedbacks)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => Learner, (learner) => learner.courseFeedbacks, {
    nullable: true,
  })
  @JoinColumn({ name: 'learnerId' })
  learner: Learner;
}
