import { Injectable } from '@nestjs/common';
import {
  DynamoDBClient,
  PutItemCommand,
  AttributeValue,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { Post } from './entity/post.dynamodb.entity';

@Injectable()
export class PostDynamodbRepository {
  private readonly tableName = 'post';
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

  async createPost(postId: string, resources: string) {
    const itemObject: Record<string, AttributeValue> = {
      postId: {
        S: postId,
      },
      body: {
        S: resources,
      },
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: itemObject,
    });

    await this.client.send(command);

    return;
  }

  async updatePostBody(postId: string, newResources: string) {
    const updateParams = {
      TableName: this.tableName,
      Key: {
        postId: { S: postId },
      },
      UpdateExpression: 'SET body = :newResources',
      ExpressionAttributeValues: {
        ':newResources': { S: newResources },
      },
    };

    const command = new UpdateItemCommand(updateParams);

    const updateResponse = await this.client.send(command);

    return updateResponse;
  }

  async findByPostId(postId: string): Promise<Post> {
    let result: Post = null;

    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        postId: { S: postId },
      },
    });

    const queryResponse = await this.client.send(command);

    result = Post.newInstanceFromDynamoDBObject(queryResponse.Item);

    return result;
  }
}
