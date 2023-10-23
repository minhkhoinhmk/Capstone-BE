import { ApiProperty } from '@nestjs/swagger';

export class FilterCourseByUserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  prepareMaterial: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalChapter: number;

  @ApiProperty()
  publishedDate: Date;

  @ApiProperty()
  totalBought: number;

  @ApiProperty()
  thumbnailUrl: string;

  @ApiProperty()
  active: boolean;
}
