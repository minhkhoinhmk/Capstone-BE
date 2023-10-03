import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GuestLoginRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Email or Username' })
  emailOrUsername: string;

  @IsString()
  @ApiProperty({ type: String, description: 'Password' })
  password: string;
}
