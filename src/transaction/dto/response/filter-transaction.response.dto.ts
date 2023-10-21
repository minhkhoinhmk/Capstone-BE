import { ApiProperty } from '@nestjs/swagger';

export class FilterTrsanctionResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  paymentAmount: number;

  @ApiProperty()
  bankTranNo: string;

  @ApiProperty()
  cardType: string;

  @ApiProperty()
  insertedDate: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  middleName: string;

  @ApiProperty()
  lastName: string;
}
