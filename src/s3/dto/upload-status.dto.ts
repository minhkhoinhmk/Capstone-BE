import { ApiProperty } from '@nestjs/swagger';

export class UploadStatus {
  @ApiProperty()
  staus: boolean;
}
