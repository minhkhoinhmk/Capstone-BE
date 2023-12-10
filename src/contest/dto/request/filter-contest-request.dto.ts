import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import ContestSortField from 'src/contest/enum/contest-sort-field';
import ContestStatus from 'src/contest/enum/contest-status.enum';

export class FilterContestRequest {
  @IsEnum(ContestStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: ContestStatus,
    description: 'ContestStatus',
  })
  status: ContestStatus;

  @IsEnum(ContestSortField)
  @IsOptional()
  @ApiPropertyOptional({
    enum: ContestSortField,
    description: 'sortField',
  })
  contestSortField: ContestSortField;

  @ApiProperty({ type: PageOptionsDto, description: 'page options' })
  @IsNotEmpty()
  pageOptions: PageOptionsDto;
}
