import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeIndexChapterLectureRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstChapterLectureId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  secondChapterLectureId: string;
}
