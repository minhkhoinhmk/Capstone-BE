import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import SortCriteria from 'src/common/pagination/dto/SortCriteria';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import SortField from 'src/question-topic/type/enum/SortField';

export class SearchPostRequest {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'search' })
  search?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ type: Boolean, description: 'active' })
  active?: boolean;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => SortCriteria)
  sortCriterias: SortCriteria<SortField>[];

  @ApiProperty({ type: PageOptionsDto, description: 'page options' })
  @IsNotEmpty()
  pageOptions: PageOptionsDto;
}
