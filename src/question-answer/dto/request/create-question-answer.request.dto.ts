import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuestionAnswerRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  questionTopicId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsOptional()
  description: string;
}
