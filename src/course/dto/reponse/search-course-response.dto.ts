import { ApiProperty } from '@nestjs/swagger';

export class SearchCourseReponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  discountPrice: number;

  @ApiProperty()
  ratedStar: number;

  @ApiProperty()
  author: string;

  @ApiProperty()
  totalLength: number;

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

  @ApiProperty()
  level: string;
}