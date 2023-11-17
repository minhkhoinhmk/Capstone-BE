import { Expose } from 'class-transformer';
import { Course } from 'src/course/entity/course.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CourseReport {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  active: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  @Expose()
  insertedDate: Date;

  @ManyToOne(() => Course, (course) => course.courseReports)
  @JoinColumn({ name: 'courseId' })
  @Expose()
  course: Course;

  @ManyToOne(() => User, (user) => user.courseReports)
  @JoinColumn({ name: 'userId' })
  @Expose()
  user: User;

  @ManyToOne(() => Learner, (learner) => learner.courseReports)
  @JoinColumn({ name: 'learnerId' })
  @Expose()
  learner: Learner;
}
