import { Expose } from 'class-transformer';
import { ChapterLecture } from 'src/chapter-lecture/entity/chapter-lecture.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class QuestionTopic {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  title: string;

  @Column({ nullable: true })
  @Expose()
  description: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  insertedDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @Column({ nullable: true })
  @Expose()
  type: string;

  @Column({ default: 0 })
  @Expose()
  rating: number;

  @Column({ default: true })
  @Expose()
  active: boolean;

  @ManyToOne(
    () => ChapterLecture,
    (chapterLecture) => chapterLecture.questionTopics,
  )
  @JoinColumn({ name: 'chapterLectureId' })
  @Expose()
  chapterLecture: ChapterLecture;

  @ManyToOne(() => User, (user) => user.questionTopics, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @Expose()
  user: User;

  @ManyToOne(() => Learner, (learner) => learner.questionTopics, {
    nullable: true,
  })
  @JoinColumn({ name: 'learnerId' })
  @Expose()
  learner: Learner;
}
