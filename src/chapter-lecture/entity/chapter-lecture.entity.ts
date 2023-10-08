import { Course } from 'src/course/entity/course.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ChapterLecture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  insertedDate: Date;

  @Column()
  updatedDate: Date;

  @Column()
  status: string;

  @Column()
  resource: string;

  @Column()
  video: string;

  @Column()
  totalContentLength: number;

  @Column()
  isPreviewed: boolean;

  @Column()
  active: boolean;

  @ManyToOne(() => Course, (course) => course.chapterLectures)
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
