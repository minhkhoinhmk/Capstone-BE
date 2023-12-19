import { Injectable } from '@nestjs/common';
import {
  DynamoDBClient,
  PutItemCommand,
  AttributeValue,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { Notification } from './entity/notification.entity';

@Injectable()
export class DynamodbRepository {
  private readonly tableName = 'notification';
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

  async createNotification(notification: Notification) {
    const itemObject: Record<string, AttributeValue> = {
      userId: {
        S: notification.userId,
      },
      title: {
        S: notification.title,
      },
      body: {
        S: notification.body,
      },
      data: {
        S: JSON.stringify(notification.data),
      },
      createdDate: {
        N: notification.createdDate.getTime().toString(),
      },
      isSeen: {
        S: notification.isSeen.toString(),
      },
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: itemObject,
    });

    await this.client.send(command);

    return notification;
  }

  async findByUserId(userId: string, size: number): Promise<Notification[]> {
    const results: Notification[] = [];

    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: `userId = :userId`,
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
      ScanIndexForward: false,
      Limit: size,
    });

    const queryResponse = await this.client.send(command);

    queryResponse.Items.forEach((item) => {
      results.push(Notification.newInstanceFromDynamoDBObject(item));
    });

    return results;
  }

  async updateIsSeen(createdDate: string, userId: string): Promise<void> {
    const createDateTime = String(new Date(createdDate).getTime());
    console.log(createDateTime);
    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        userId: { S: userId },
        createdDate: { N: createDateTime },
      },
      UpdateExpression: 'SET isSeen = :isSeen',
      ExpressionAttributeValues: {
        ':isSeen': { S: 'true' },
      },
    });

    await this.client.send(command);
  }
}
