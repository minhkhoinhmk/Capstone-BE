import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class ChangeIndexChapterLectureRequest {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  chapterLectureIds: string[];
}
