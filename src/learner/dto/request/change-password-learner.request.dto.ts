import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from 'src/common/decorator/match.decorator';

export class ChangePasswordLearnerRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'learnerId' })
  learnerId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(32)
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
