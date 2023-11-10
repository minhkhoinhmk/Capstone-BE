import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { NameOrderStatus } from 'src/order/enum/name-order-status.enum';

export class UpdateTransactionRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  orderId: string;

  @ApiProperty({ enum: NameOrderStatus, description: 'Name of order status' })
  @IsEnum(NameOrderStatus)
  @IsOptional()
  nameOrderStatus: NameOrderStatus;

  //   @IsNumber()
  //   @IsNotEmpty()
  //   @ApiProperty()
  //   paymentAmount: number;

  //   @IsString()
  //   @IsNotEmpty()
  //   @ApiProperty()
  //   bankCode: string;

  //   @IsString()
  //   @IsOptional()
  //   @ApiProperty()
  //   bankTranNo: string;

  //   @IsString()
  //   @IsNotEmpty()
  //   @ApiProperty()
  //   cardType: string;

  //   @IsString()
  //   @IsNotEmpty()
  //   @ApiProperty()
  //   responseCode: string;
}
