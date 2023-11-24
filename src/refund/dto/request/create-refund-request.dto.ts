import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRefundRequest {
  @ApiProperty({ type: 'string', description: "user's bank" })
  @IsString()
  @IsNotEmpty()
  bank: string;

  @ApiProperty({ type: 'string', description: "user's account number" })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ type: 'string', description: "user's refund reason" })
  @IsString()
  @IsNotEmpty()
  refundReason: string;
}
