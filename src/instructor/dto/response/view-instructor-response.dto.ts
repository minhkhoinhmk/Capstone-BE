import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ViewInstructorResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  middleName: string;

  @ApiProperty()
  @Expose()
  userName: string;

  @ApiProperty()
  @Expose()
  password: string;

  @ApiProperty()
  @Expose()
  avatar: string;

  @ApiProperty()
  @Expose()
  phoneNumber: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  active: boolean;

  @ApiProperty()
  @Expose()
  bank: string;

  @ApiProperty()
  @Expose()
  accountNumber: string;

  @ApiProperty()
  @Expose()
  certificateUrl: string;

  @ApiProperty()
  @Expose()
  reason: string;
}
