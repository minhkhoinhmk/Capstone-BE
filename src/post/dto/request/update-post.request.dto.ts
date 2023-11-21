import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePostRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsOptional()
  resources: string;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  active: boolean;
}
