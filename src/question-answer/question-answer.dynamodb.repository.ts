import { Injectable } from '@nestjs/common';
import {
  DynamoDBClient,
  PutItemCommand,
  AttributeValue,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { QuestionAnswer } from './entity/question-answer.dynamodb.entity';

@Injectable()
export class QuestionAnswerDynamodbRepository {
  private readonly tableName = 'question-answer';
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

  async createQuestionAnswer(questionAnswer: QuestionAnswer) {
    const itemObject: Record<string, AttributeValue> = {
      questionAnswerId: {
        S: questionAnswer.questionAnswerId,
      },
      body: {
        S: questionAnswer.body,
      },
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: itemObject,
    });

    await this.client.send(command);

    return questionAnswer;
  }

  async findByQuestionAnswerId(
    questionAnswerId: string,
  ): Promise<QuestionAnswer> {
    let result: QuestionAnswer = null;

    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        questionAnswerId: { S: questionAnswerId },
      },
    });

    const queryResponse = await this.client.send(command);

    result = QuestionAnswer.newInstanceFromDynamoDBObject(queryResponse.Item);

    return result;
  }
}
