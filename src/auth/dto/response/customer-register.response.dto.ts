import { ApiProperty } from '@nestjs/swagger';

export class CustomerRegisterResponse {
  @ApiProperty({ type: String, description: 'email' })
  email: string;
}
