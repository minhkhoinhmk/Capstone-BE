import { ApiProperty } from '@nestjs/swagger';

export class CourseDetailResponse {
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
  promotionCourseByStaffId: string | null;

  @ApiProperty()
  ratedStar: number;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  category: string;

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
