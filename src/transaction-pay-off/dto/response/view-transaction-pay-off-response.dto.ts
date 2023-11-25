import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ViewTransactionPayOffResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  senderId: string;

  @ApiProperty()
  @Expose()
  totalPaymentAmount: number;

  @ApiProperty()
  @Expose()
  active: boolean;

  @ApiProperty()
  @Expose()
  insertedDate: Date;
}
