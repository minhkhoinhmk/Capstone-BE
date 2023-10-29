import { Expose } from 'class-transformer';
import { Course } from 'src/course/entity/course.entity';
import { UserLecture } from 'src/user-lecture/entity/user-lecture.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ChapterLecture {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  title: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  insertedDate: Date;

  @Column()
  @Expose()
  updatedDate: Date;

  @Column()
  @Expose()
  status: string;

  @Column()
  @Expose()
  resource: string;

  @Column()
  @Expose()
  video: string;

  @Column()
  @Expose()
  totalContentLength: number;

  @Column()
  @Expose()
  isPreviewed: boolean;

  @Column()
  @Expose()
  active: boolean;

  @ManyToOne(() => Course, (course) => course.chapterLectures)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => UserLecture, (userLecture) => userLecture.chapterLecture)
  userLectures: UserLecture[];
}
