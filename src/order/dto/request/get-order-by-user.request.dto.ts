import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';

import { NameOrderStatus } from 'src/order/enum/name-order-status.enum';

export class GetOrderByUserRequest {
  @IsEnum(NameOrderStatus)
  @IsOptional()
  orderStatus: NameOrderStatus;

  @ApiProperty({ type: PageOptionsDto, description: 'page options' })
  @IsNotEmpty()
  pageOptions: PageOptionsDto;
}
