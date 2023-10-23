import { Course } from 'src/course/entity/course.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class LearnerCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  active: boolean;

  @ManyToOne(() => Learner, (learner) => learner.learnerCourses)
  @JoinColumn({ name: 'learnerId' })
  learner: Learner;

  @ManyToOne(() => Course, (course) => course.learnerCourses)
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
