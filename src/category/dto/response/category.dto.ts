import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({ type: String, description: 'id' })
  id: string;

  @ApiProperty({ type: String, description: 'name' })
  name: string;

  @ApiProperty({ type: Boolean, description: 'active' })
  active: boolean;

  @ApiProperty({ type: Number, description: 'total number of courses' })
  totalCourses: number;

  @ApiProperty({ type: Date, description: 'inserted date' })
  insertedDate: Date;

  @ApiProperty({ type: Date, description: 'updated date' })
  updatedDate: Date;

  @ApiProperty({ type: String, description: 'thumbnailURL' })
  thumbnailUrl: string;
}
