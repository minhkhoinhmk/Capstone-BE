import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PromotionCourseModule } from 'src/promotion-course/promotion-course.module';
import { OrderModule } from 'src/order/order.module';
import { QuestionTopicMapper } from './mapper/question-topic.mapper';
import { QuestionTopic } from './entity/question-topic.entity';
import { QuestionTopicService } from './question-topic.service';
import { QuestionTopicRepository } from './question-topic.repository';
import { QuestionTopicDynamodbRepository } from './question-topic.dynamodb.repository';
import { QuestionTopicController } from './question-topic.controller';
import { ChapterLectureModule } from 'src/chapter-lecture/chapter-lecture.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionTopic]),
    ConfigModule,
    forwardRef(() => AuthModule),
    PromotionCourseModule,
    ChapterLectureModule,
    forwardRef(() => OrderModule),
  ],
  providers: [
    QuestionTopicService,
    QuestionTopicRepository,
    QuestionTopicDynamodbRepository,
    QuestionTopicMapper,
  ],
  controllers: [QuestionTopicController],
  exports: [
    QuestionTopicService,
    QuestionTopicRepository,
    QuestionTopicDynamodbRepository,
    QuestionTopicMapper,
  ],
})
export class QuestionTopicModule {}
