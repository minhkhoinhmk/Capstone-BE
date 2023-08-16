import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { CharacterRole } from '../enum/character-role.enum';
import { Lane } from '../enum/lane.enum';

export class CreateCharacterDto {
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsEnum(CharacterRole)
  role: CharacterRole;

  @IsEnum(Lane)
  lane: Lane;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  imgUrl: string;
}
