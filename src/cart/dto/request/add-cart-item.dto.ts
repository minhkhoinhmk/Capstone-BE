import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddCartItemRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Id of course' })
  courseId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, description: 'Id of promotion course' })
  promotionCourseId?: string;
}
