import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCourseFeedbackRequest {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  ratedStar: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}
