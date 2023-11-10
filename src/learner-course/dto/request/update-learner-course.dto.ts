import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLearnerCourseRequest {
  @ApiProperty()
  @IsString()
  currentLearnerId: string;

  @ApiProperty()
  @IsString()
  newLearnerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
