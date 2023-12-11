import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateContestRequest {
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
  startedDate: Date;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  expiredDate: Date;

  @IsBoolean()
  @ApiProperty()
  @IsNotEmpty()
  isVisible: boolean;
}
