import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CompletedUserLectureRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  chapterLectureId: string;
}
