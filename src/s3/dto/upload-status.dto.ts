import { ApiProperty } from '@nestjs/swagger';

export class UploadStatus {
  @ApiProperty()
  status: boolean;
}
