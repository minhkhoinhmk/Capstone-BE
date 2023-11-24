import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Course } from 'src/course/entity/course.entity';
import { QuestionTopic } from 'src/question-topic/entity/question-topic.entity';
import { UserLecture } from 'src/user-lecture/entity/user-lecture.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ChapterLecture {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: true })
  @Expose()
  index: number;

  @Column()
  @Expose()
  title: string;

  @Column()
  @Expose()
  description: string;

  @ApiProperty({ type: Date, description: 'Inserted date' })
  @CreateDateColumn()
  insertedDate: Date;

  @ApiProperty({ type: Date, description: 'Updated date' })
  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  @Expose()
  status: string;

  @Column({ nullable: true })
  @Expose()
  resource: string;

  @Column({ nullable: true })
  @Expose()
  video: string;

  @Column({ nullable: true })
  @Expose()
  totalContentLength: number;

  @Column()
  @Expose()
  isPreviewed: boolean;

  @Column()
  @Expose()
  active: boolean;

  @Column({ nullable: true })
  @Expose()
  fileSize: number;

  @ManyToOne(() => Course, (course) => course.chapterLectures)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => UserLecture, (userLecture) => userLecture.chapterLecture)
  userLectures: UserLecture[];

  @OneToMany(
    () => QuestionTopic,
    (questionTopic) => questionTopic.chapterLecture,
  )
  questionTopics: QuestionTopic[];
}
