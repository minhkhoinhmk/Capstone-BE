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
}
