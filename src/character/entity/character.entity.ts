import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CharacterRole } from '../enum/character-role.enum';
import { Lane } from '../enum/lane.enum';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@Entity()
export class Character {
  @ApiProperty({ type: UUID, description: 'UUIDe of the character' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: String, description: 'Name of the character' })
  @Column({
    length: 100,
  })
  name: string;

  @ApiProperty({ enum: CharacterRole, description: 'Role of the character' })
  @Column()
  role: CharacterRole;

  @ApiProperty({ enum: Lane, description: 'Lane of the character' })
  @Column()
  lane: Lane;

  @ApiProperty({ type: String, description: 'Description of the character' })
  @Column()
  description: string;

  @ApiProperty({ type: String, description: 'Link image of the character' })
  @Column()
  imgUrl: string;

  @ApiProperty({ type: Boolean, description: 'Is active of the character' })
  @Column()
  isActive: boolean;
}
