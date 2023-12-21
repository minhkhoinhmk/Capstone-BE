import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Winner } from 'src/winner/entity/winner.entity';

export class ViewContestResponse {
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
  thumbnailUrl: string;

  @ApiProperty()
  @Expose()
  insertedDate: Date;

  @ApiProperty()
  @Expose()
  updatedDate: Date;

  @ApiProperty()
  @Expose()
  prize: string;

  @ApiProperty()
  @Expose()
  startedDate: Date;

  @ApiProperty()
  @Expose()
  expiredDate: Date;

  @ApiProperty()
  @Expose()
  active: boolean;

  @ApiProperty()
  @Expose()
  isVisible: boolean;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  staffName: string;

  @ApiProperty()
  @Expose()
  totalCustomerDrawing: number;

  @ApiProperty()
  @Expose()
  winners: Winner[];
}
