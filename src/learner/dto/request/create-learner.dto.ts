import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLearnerRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'First Name' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Last Name' })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Middle Name' })
  middleName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(32)
  @ApiProperty({ type: String, description: 'Password' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Username' })
  userName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Jwt of user' })
  userJwt: string;
}
