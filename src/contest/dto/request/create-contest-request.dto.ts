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

  @ApiProperty()
  @IsNotEmpty()
  startedDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  expiredDate: Date;
}
