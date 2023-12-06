import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateIsViewOfStaffRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'promotionCourseId of promotionCourse',
  })
  promotionCourseId: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ type: Boolean, description: 'isView of promotionCourse' })
  isView: boolean;
}
