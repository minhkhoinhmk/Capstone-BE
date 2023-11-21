import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategotyRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', description: 'name of category' })
  name: string;
}
