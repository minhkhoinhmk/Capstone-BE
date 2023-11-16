import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseReportRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', description: 'report from user' })
  description: string;
}
