import { Injectable } from '@nestjs/common';
import {
  DynamoDBClient,
  PutItemCommand,
  AttributeValue,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { QuestionTopic } from './entity/question-topic.dynamodb.entity';

@Injectable()
export class QuestionTopicDynamodbRepository {
  private readonly tableName = 'question-topic';
  private readonly client: DynamoDBClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new DynamoDBClient({
      region: this.configService.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async createQuestionTopic(questionTopic: QuestionTopic) {
    const itemObject: Record<string, AttributeValue> = {
      questionTopicId: {
        S: questionTopic.questionTopicId,
      },
      body: {
        S: questionTopic.body,
      },
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: itemObject,
    });

    await this.client.send(command);

    return questionTopic;
  }

  async findByQuestionTopicId(questionTopicId: string): Promise<QuestionTopic> {
    let result: QuestionTopic = null;

    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        questionTopicId: { S: questionTopicId },
      },
    });

    const queryResponse = await this.client.send(command);

    result = QuestionTopic.newInstanceFromDynamoDBObject(queryResponse.Item);

    return result;
  }
}
