import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'title of promotion' })
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, description: 'discountpercent of promotion' })
  discountPercent: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ type: String, description: 'Note of promotion' })
  note: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'effectiveDate of promotion' })
  effectiveDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'expiredDate of promotion' })
  expiredDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'code of promotion' })
  code: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, description: 'amount of promotion' })
  amount: number;
}
