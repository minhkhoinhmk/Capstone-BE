import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceTokenRequest {
  @ApiProperty({ type: 'string', description: 'Token from your device' })
  deviceTokenId: string;
}
