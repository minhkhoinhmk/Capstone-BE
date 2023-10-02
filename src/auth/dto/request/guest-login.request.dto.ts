import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GuestLoginRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Email or Username' })
  emailOrUsername: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password must be stronger',
  })
  @ApiProperty({ type: String, description: 'Password' })
  password: string;
}
