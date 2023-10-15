import { ApiProperty } from '@nestjs/swagger';
import { NameRole } from 'src/role/enum/name-role.enum';

export class CourseFeedbackResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ratedStar: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  insertedDate: Date;

  @ApiProperty()
  insertedBy: string;

  @ApiProperty()
  updatedDate: Date;

  @ApiProperty()
  updatedBy: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  role: NameRole[];
}
