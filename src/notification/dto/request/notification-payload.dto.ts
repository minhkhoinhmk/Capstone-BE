import { ApiProperty } from '@nestjs/swagger';

export class NotificationPayload {
  @ApiProperty()
  token: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  data: any;
}
