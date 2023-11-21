import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCourseRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  prepareMaterial: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  levelId: string;
}
