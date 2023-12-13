import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateLearnerRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'userName' })
  userName: string;

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
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'LearnerID' })
  learnerId: string;
}
