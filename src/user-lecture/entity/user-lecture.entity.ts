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
} from 'typeorm';

@Entity()
export class UserLecture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isCompleted: boolean;

  @Column()
  @CreateDateColumn()
  insertedDate: Date;

  @ManyToOne(() => Learner, (learner) => learner.userLectures)
  @JoinColumn({ name: 'learnerId' })
  learner: Learner;

  @ManyToOne(() => User, (user) => user.userLectures)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(
    () => ChapterLecture,
    (chapterLecture) => chapterLecture.userLectures,
  )
  @JoinColumn({ name: 'chapterLectureId' })
  chapterLecture: ChapterLecture;
}
