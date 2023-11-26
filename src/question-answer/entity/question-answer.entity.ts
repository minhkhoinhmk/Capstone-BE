import { Expose } from 'class-transformer';
import { ChapterLecture } from 'src/chapter-lecture/entity/chapter-lecture.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { QuestionTopic } from 'src/question-topic/entity/question-topic.entity';
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
export class QuestionAnswer {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: true })
  @Expose()
  description: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  insertedDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @Column({ default: true })
  @Expose()
  active: boolean;

  @ManyToOne(
    () => QuestionTopic,
    (questionTopic) => questionTopic.questionAnswers,
  )
  @JoinColumn({ name: 'questionTopicId' })
  @Expose()
  questionTopic: QuestionTopic;

  @ManyToOne(() => User, (user) => user.questionAnswers, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @Expose()
  user: User;

  @ManyToOne(() => Learner, (learner) => learner.questionAnswers, {
    nullable: true,
  })
  @JoinColumn({ name: 'learnerId' })
  @Expose()
  learner: Learner;
}
