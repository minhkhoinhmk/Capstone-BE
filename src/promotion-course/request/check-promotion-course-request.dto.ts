import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckPromotionCourseRequest {
  @IsString()
  @ApiPropertyOptional({ type: String, description: 'courseId' })
  courseId: string;

  @IsString()
  @ApiPropertyOptional({ type: String, description: 'code' })
  code: string;
}
