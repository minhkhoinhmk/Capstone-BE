import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ViewCustomerDrawingResponse {
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
  imageUrl: string;

  @ApiProperty()
  @Expose()
  insertedDate: Date;

  @ApiProperty()
  @Expose()
  approved: boolean;

  @ApiProperty()
  @Expose()
  active: boolean;

  @ApiProperty()
  @Expose()
  customerName: string;

  @ApiProperty()
  @Expose()
  contestName: string;

  @ApiProperty()
  @Expose()
  totalVotes: number;
}
