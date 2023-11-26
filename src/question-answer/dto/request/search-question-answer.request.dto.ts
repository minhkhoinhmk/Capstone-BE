import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import SortField from 'src/question-topic/type/enum/SortField';

export class SearchQuestionAnswerRequest {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ type: String, description: 'questionTopicId' })
  questionTopicId?: string;

  @IsBoolean()
  active: boolean;

  @IsEnum(SortField)
  @IsOptional()
  @ApiPropertyOptional({ enum: SortField, description: 'sortField' })
  sortField: SortField;

  @ApiProperty({ type: PageOptionsDto, description: 'page options' })
  @IsNotEmpty()
  pageOptions: PageOptionsDto;
}
