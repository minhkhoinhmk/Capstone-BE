import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class DefinePromotionForWinnerRequest {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  discountPercentFirst: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  effectiveDateFirst: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expiredDateFirst: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  discountPercentSecond: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  effectiveDateSecond: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expiredDateSecond: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  discountPercentThird: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  effectiveDateThird: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expiredDateThird: string;
}
