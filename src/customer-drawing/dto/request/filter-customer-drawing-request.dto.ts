import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import CustomerDrawingSortField from 'src/customer-drawing/enum/customer-drawing-sort-field';

export class FilterCustomerDrawingRequest {
  @IsEnum(CustomerDrawingSortField)
  @IsOptional()
  @ApiPropertyOptional({
    enum: CustomerDrawingSortField,
    description: 'sortField',
  })
  customerDrawingSortField: CustomerDrawingSortField;

  @ApiProperty({ type: PageOptionsDto, description: 'page options' })
  @IsNotEmpty()
  pageOptions: PageOptionsDto;
}
