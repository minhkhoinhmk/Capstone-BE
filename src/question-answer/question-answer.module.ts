import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { QuestionAnswer } from './entity/question-answer.entity';
import { QuestionAnswerService } from './question-answer.service';
import { QuestionAnswerRepository } from './question-answer.repository';
import { QuestionAnswerDynamodbRepository } from './question-answer.dynamodb.repository';
import { QuestionAnswerMapper } from './mapper/question-answer.mapper';
import { QuestionAnswerController } from './question-answer.controller';
import { QuestionTopicModule } from 'src/question-topic/question-topic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionAnswer]),
    ConfigModule,
    forwardRef(() => AuthModule),
    QuestionTopicModule,
  ],
  providers: [
    QuestionAnswerService,
    QuestionAnswerRepository,
    QuestionAnswerDynamodbRepository,
    QuestionAnswerMapper,
  ],
  controllers: [QuestionAnswerController],
  exports: [
    QuestionAnswerService,
    QuestionAnswerRepository,
    QuestionAnswerDynamodbRepository,
    QuestionAnswerMapper,
  ],
})
export class QuestionAnswerModule {}
