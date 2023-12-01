import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ViewAchievementReponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  path: string;

  @ApiProperty()
  @Expose()
  insertedDate: Date;

  @ApiProperty()
  @Expose()
  active: boolean;

  @ApiProperty()
  @Expose()
  customerName: string;

  @ApiProperty()
  @Expose()
  learnerName: string;

  @ApiProperty()
  @Expose()
  courseName: string;
}
