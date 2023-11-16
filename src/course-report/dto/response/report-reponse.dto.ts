import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CourseReportResponse {
  @ApiProperty({ type: 'string', description: 'Course report ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: 'string', description: 'Course report description' })
  @Expose()
  description: string;

  @ApiProperty({ type: 'boolean', description: 'Is active' })
  @Expose()
  active: boolean;

  @ApiProperty({ type: 'Date', description: 'Created date' })
  @Expose()
  insertedDate: Date;

  @ApiProperty({ type: 'string', description: 'User first name' })
  @Expose()
  firstName: string;

  @ApiProperty({ type: 'string', description: 'User middle name' })
  @Expose()
  middleName: string;

  @ApiProperty({ type: 'string', description: 'User last name' })
  @Expose()
  lastName: string;

  @ApiProperty({ type: 'string', description: 'Username or email' })
  @Expose()
  userNameOrEmail: string;
}
