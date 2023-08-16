import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CharacterRole } from '../enum/character-role.enum';
import { Lane } from '../enum/lane.enum';

@Entity()
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column()
  role: CharacterRole;

  @Column()
  lane: Lane;

  @Column()
  description: string;

  @Column()
  imgUrl: string;
}
