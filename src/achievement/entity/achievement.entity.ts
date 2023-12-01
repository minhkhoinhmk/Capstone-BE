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
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;

  @Column()
  insertedDate: Date;

  @Column()
  active: boolean;

  @ManyToOne(() => User, (user) => user.achievements, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Learner, (learner) => learner.achievements, {
    nullable: true,
  })
  @JoinColumn({ name: 'learnerId' })
  learner: Learner;

  @ManyToOne(() => Course, (course) => course.achievements, {
    nullable: true,
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
