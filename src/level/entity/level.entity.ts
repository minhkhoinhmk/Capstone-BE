import { Course } from 'src/course/entity/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class Level {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  insertedDate: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @Column()
  active: boolean;

  @OneToMany(() => Course, (course) => course.level)
  courses: Course[];
}
