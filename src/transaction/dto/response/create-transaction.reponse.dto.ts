import { ApiProperty } from '@nestjs/swagger';

export class CreateTrsanctionResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  paymentAmount: number;

  @ApiProperty()
  bankTranNo: string | null;

  @ApiProperty()
  cardType: string;

  @ApiProperty()
  insertedDate: Date;

  @ApiProperty()
  status: string;
}
