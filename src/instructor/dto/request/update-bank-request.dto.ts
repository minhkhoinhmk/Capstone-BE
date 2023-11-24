import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBankRequest {
  @ApiProperty({ type: 'string', description: "instructor's bank" })
  @IsString()
  @IsNotEmpty()
  bank: string;

  @ApiProperty({ type: 'string', description: "instructor's account number" })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}
