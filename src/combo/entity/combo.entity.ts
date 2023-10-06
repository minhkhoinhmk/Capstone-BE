import { Course } from 'src/course/entity/course.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Combo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  comboPrice: number;

  @Column()
  active: boolean;

  @ManyToMany(() => Course, (courses) => courses.combos)
  @JoinTable({
    name: 'combo_course',
    joinColumn: { name: 'comboId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'courseId', referencedColumnName: 'id' },
  })
  courses: Course[];
}
