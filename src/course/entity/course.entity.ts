import { Category } from 'src/category/entity/category.entity';
import { ChapterLecture } from 'src/chapter-lecture/entity/chapter-lecture.entity';
import { Combo } from 'src/combo/entity/combo.entity';
import { CourseFeedback } from 'src/course-feedback/entity/course-feedbacl.entity';
import Level from 'src/level/entity/level.entity';
import { PromotionCourse } from 'src/promotion-course/entity/promotion-course.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  desciption: string;

  @Column()
  price: number;

  @Column()
  shortDescription: string;

  @Column()
  prepareMaterial: string;

  @Column()
  status: boolean;

  @Column()
  totalChapter: number;

  @Column()
  publishedDate: Date;

  @Column()
  totalBought: number;

  @Column()
  thumbnailUrl: string;

  @Column()
  active: boolean;

  @OneToMany(
    () => PromotionCourse,
    (promotionCourse) => promotionCourse.promotion,
  )
  promotionCourses: PromotionCourse[];

  @OneToMany(() => CourseFeedback, (courseFeedback) => courseFeedback.course)
  courseFeedbacks: CourseFeedback[];

  @OneToMany(() => ChapterLecture, (chapterLecture) => chapterLecture.course)
  chapterLectures: ChapterLecture[];

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'instructorId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Level, (level) => level.courses)
  @JoinColumn({ name: 'levelId' })
  level: Level;

  @ManyToMany(() => Combo, (combos) => combos.courses)
  combos: Combo[];
}
