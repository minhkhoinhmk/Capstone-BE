import { Achievement } from 'src/achievement/entity/achievement.entity';
import { CourseFeedback } from 'src/course-feedback/entity/course-feedbacl.entity';
import { CourseReport } from 'src/course-report/entity/course-report.entity';
import { Device } from 'src/device/entity/device.entity';
import { LearnerCourse } from 'src/learner-course/entity/learner-course.entity';
import { QuestionAnswer } from 'src/question-answer/entity/question-answer.entity';
import { QuestionTopic } from 'src/question-topic/entity/question-topic.entity';
import { UserLecture } from 'src/user-lecture/entity/user-lecture.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Learner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 100,
  })
  firstName: string;

  @Column({
    length: 100,
  })
  lastName: string;

  @Column({
    length: 100,
  })
  middleName: string;

  @Column({
    length: 100,
    unique: true,
  })
  userName: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  active: boolean;

  @Column()
  role: string;

  @OneToMany(() => CourseFeedback, (courseFeedback) => courseFeedback.learner)
  courseFeedbacks: CourseFeedback[];

  @OneToMany(() => LearnerCourse, (learnerCourse) => learnerCourse.learner)
  learnerCourses: LearnerCourse[];

  @OneToMany(() => UserLecture, (userLecture) => userLecture.learner)
  userLectures: UserLecture[];

  @OneToMany(() => Device, (device) => device.learner)
  devices: Device[];

  @OneToMany(() => CourseReport, (courseReport) => courseReport.learner)
  courseReports: CourseReport[];

  @ManyToOne(() => User, (user) => user.learners)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => QuestionTopic, (questionTopic) => questionTopic.learner)
  questionTopics: QuestionTopic[];

  @OneToMany(() => QuestionAnswer, (questionAnswer) => questionAnswer.learner)
  questionAnswers: QuestionAnswer[];

  @OneToMany(() => Achievement, (achievement) => achievement.learner)
  achievements: Achievement[];
}
