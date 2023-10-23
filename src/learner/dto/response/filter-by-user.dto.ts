import { boolean } from '@hapi/joi';
import { ApiProperty } from '@nestjs/swagger';

export class FilterLearnerByUserResponse {
  @ApiProperty({ type: String, description: 'Id' })
  id: string;

  @ApiProperty({ type: String, description: 'First Name' })
  firstName: string;

  @ApiProperty({ type: String, description: 'Last Name' })
  lastName: string;

  @ApiProperty({ type: String, description: 'Middle Name' })
  middleName: string;

  @ApiProperty({ type: String, description: 'Username' })
  userName: string;

  @ApiProperty({ type: boolean, description: 'Active' })
  active: boolean;
}
