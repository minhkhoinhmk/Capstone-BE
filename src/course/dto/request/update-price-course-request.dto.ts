import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class UpdatePriceCourseRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;

  @IsNumber()
  @Min(10000, { message: 'price min is 10000' })
  @Max(10000000, { message: 'price max is 10000000' })
  @IsNotEmpty()
  @ApiProperty()
  price: number;
}
