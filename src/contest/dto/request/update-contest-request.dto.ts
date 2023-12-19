import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

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

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  discountPercentFirst: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  discountPercentSecond: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  discountPercentThird: number;
}
