import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTransactionRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  orderId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  paymentAmount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  bankCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  bankTranNo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  cardType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  responseCode: string;
}
