import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CourseStatus } from 'src/course/type/enum/CourseStatus';

export class SetStatusRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  reason: string;

  @IsEnum(CourseStatus)
  @IsNotEmpty()
  @ApiProperty()
  status: CourseStatus;
}
