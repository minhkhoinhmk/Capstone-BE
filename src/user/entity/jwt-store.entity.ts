import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class JwtStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @ManyToOne(() => User, (user) => user.jwts)
  @JoinColumn({ name: 'userId' })
  user: User;
}
