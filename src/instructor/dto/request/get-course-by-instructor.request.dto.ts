import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { CourseStatus } from 'src/course/type/enum/CourseStatus';
import SortField from 'src/course/type/enum/SortField';

export class GetCourseByInstructorRequest {
  @IsEnum(CourseStatus)
  @IsOptional()
  courseStatus: CourseStatus;

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
