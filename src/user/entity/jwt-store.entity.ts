import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JwtStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column()
  userId: string;
}
