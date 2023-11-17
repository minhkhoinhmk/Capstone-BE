import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FilterCourseByCustomerResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  shortDescription: string;

  @ApiProperty()
  @Expose()
  prepareMaterial: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  totalChapter: number;

  @ApiProperty()
  @Expose()
  publishedDate: Date;

  @ApiProperty()
  @Expose()
  totalBought: number;

  @ApiProperty()
  @Expose()
  thumbnailUrl: string;

  @ApiProperty()
  @Expose()
  active: boolean;
}
