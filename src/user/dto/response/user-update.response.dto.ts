import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateResponse {
  @ApiProperty({ type: String, description: 'email' })
  email: string;
}
