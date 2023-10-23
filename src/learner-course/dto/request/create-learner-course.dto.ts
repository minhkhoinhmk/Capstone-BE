import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLearnerCourseRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  learnerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
