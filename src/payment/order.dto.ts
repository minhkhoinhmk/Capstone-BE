import {
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class createPaymentURLDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ name: 'orderId', description: 'Mã đơn hàng' })
  readonly orderId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ name: 'message', description: 'Nội dung thanh toán' })
  readonly message: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(5000)
  @ApiProperty({
    name: 'amount',
    description: 'Số tiền thanh toán',
    minimum: 5000,
    default: 5000,
  })
  readonly amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: 'language',
    description: 'Ngôn ngữ thanh toán',
    default: 'vn',
  })
  readonly language: string;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional({ name: 'Return URl', description: 'Đường dẫn trả về' })
  readonly returnUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    name: 'bankCode',
    description: 'Mã ngân hàng thanh toán',
  })
  readonly bankCode?: string;

  @IsIP()
  @IsOptional()
  @ApiPropertyOptional({
    name: 'ip',
    description: 'Địa chỉ IP của khách hàng',
  })
  readonly ip?: string;
}
