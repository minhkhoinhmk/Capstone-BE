import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from 'src/common/decorator/match.decorator';
import { NotMatch } from 'src/common/decorator/not-match.decorator';

export class UserChangePasswordRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Current Password' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'New password must be stronger',
  })
  @NotMatch('currentPassword', {
    message: 'Current password and New password must not be match',
  })
  @ApiProperty({ type: String, description: 'New Password' })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Match('newPassword', {
    message: 'New password and Confirmation new password must be match',
  })
  @ApiProperty({ type: String, description: 'Confirm new password' })
  confirmNewPassword: string;
}

// @IsStrongPassword({
//   minLength: 8,
//   minLowercase: 1,
//   minNumbers: 1,
//   minSymbols: 1,
//   minUppercase: 1
// })
