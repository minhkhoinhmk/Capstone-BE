import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import ContestStatus from 'src/contest/enum/contest-status.enum';

export class FilterContestRequest {
  @IsEnum(ContestStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: ContestStatus,
    description: 'ContestStatus',
  })
  status: ContestStatus;

  @ApiProperty({ type: PageOptionsDto, description: 'page options' })
  @IsNotEmpty()
  pageOptions: PageOptionsDto;
}
