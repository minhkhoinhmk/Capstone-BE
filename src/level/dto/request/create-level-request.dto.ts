import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLevelRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', description: 'name of level' })
  name: string;
}
