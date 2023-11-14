import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundRequest {
  @ApiProperty({ type: 'string', description: "user's bank" })
  bank: string;

  @ApiProperty({ type: 'string', description: "user's account number" })
  accountNumber: string;

  @ApiProperty({ type: 'string', description: "user's refund reason" })
  refundReason: string;
}
