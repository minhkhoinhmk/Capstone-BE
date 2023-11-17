import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateChapterLectureRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  chapterLectureId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  description: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  isPreviewed: boolean;
}
