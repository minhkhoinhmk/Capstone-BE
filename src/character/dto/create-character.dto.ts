import { IsBoolean, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { CharacterRole } from '../enum/character-role.enum';
import { Lane } from '../enum/lane.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCharacterDto {
  @ApiProperty({ type: String, description: 'Name of the character' })
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ enum: CharacterRole, description: 'Role of the character' })
  @IsEnum(CharacterRole)
  role: CharacterRole;

  @ApiProperty({ enum: Lane, description: 'Lane of the character' })
  @IsEnum(Lane)
  lane: Lane;

  @ApiProperty({ type: String, description: 'Description of the character' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: String, description: 'Link image of the character' })
  @IsNotEmpty()
  imgUrl: string;

  @ApiProperty({ type: Boolean, description: 'Is active of the character' })
  @IsBoolean()
  isActive: boolean;
}
