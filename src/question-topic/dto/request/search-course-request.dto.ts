import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import SortField from 'src/course/type/enum/SortField';

export class SearchCourseRequest {
  @IsArray()
  @ApiProperty({ type: [String], description: 'Array of id levels' })
  levels: string[];

  @IsArray()
  @ApiProperty({ type: [String], description: 'Array of id categories' })
  categories: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'search' })
  search: string;

  @IsEnum(SortField)
  @IsOptional()
  @ApiPropertyOptional({ enum: SortField, description: 'sortField' })
  sortField: SortField;

  @ApiProperty({ type: PageOptionsDto, description: 'page options' })
  @IsNotEmpty()
  pageOptions: PageOptionsDto;
}
