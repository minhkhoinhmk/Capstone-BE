import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePromotionCourseRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'courseId of promotionCourse' })
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'promotionId of promotionCourse' })
  promotionId: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ type: Boolean, description: 'isView of promotionCourse' })
  isView: boolean;
}
