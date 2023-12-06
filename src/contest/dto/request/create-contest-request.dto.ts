import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContestRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prize: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  startedDate: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  expiredDate: string;
}
