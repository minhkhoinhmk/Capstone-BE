import { ApiProperty } from '@nestjs/swagger';

export class ViewTransactionOrderDetailResponse {
  @ApiProperty()
  refundId: string;

  @ApiProperty()
  paymentAmount: number;

  @ApiProperty()
  refundAmount: number;

  @ApiProperty()
  insertedDate: Date;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  courseName: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  buyer: string;
}
