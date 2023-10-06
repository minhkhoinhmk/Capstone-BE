import { Course } from 'src/course/entity/course.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  active: boolean;

  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];
}
