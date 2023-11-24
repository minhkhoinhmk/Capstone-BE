import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InstructorStatus } from 'src/instructor/enum/instructor-status.enum';

export class SetInstructorStatusRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  instructorId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  reason: string;

  @IsEnum(InstructorStatus)
  @IsNotEmpty()
  @ApiProperty()
  status: InstructorStatus;
}
