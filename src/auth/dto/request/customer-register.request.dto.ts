import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NameRole } from 'src/role/enum/name-role.enum';

export class UserRegisterRequest {
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
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password must be stronger',
  })
  @ApiProperty({ type: String, description: 'Password' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Phone Number' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ type: String, description: 'Email' })
  email: string;

  @IsEnum(NameRole)
  @IsNotEmpty()
  @ApiProperty({ enum: NameRole, description: 'Role' })
  role: NameRole;
}
