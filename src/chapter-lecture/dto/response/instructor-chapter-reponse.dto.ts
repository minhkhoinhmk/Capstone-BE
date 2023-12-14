import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class InstructorChapterResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  index: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  insertedDate: Date;

  @ApiProperty()
  @Expose()
  updatedDate: Date;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  resource: string;

  @ApiProperty()
  @Expose()
  video: string;

  @ApiProperty()
  @Expose()
  totalContentLength: number;

  @ApiProperty()
  @Expose()
  isPreviewed: boolean;

  @ApiProperty()
  @Expose()
  active: boolean;
}
