import { CreatePost } from '../dto/dynamodb/create-post.dynamodb.dto';

export class Post {
  postId: string;

  body: string;

  static newInstanceFromDynamoDBObject(data: any): Post {
    const result = new Post();
    result.body = data.body.S;
    result.postId = data.postId.S;

    return result;
  }

  static newInstanceFromDto(data: CreatePost): Post {
    const result = new Post();
    result.postId = data.postId;
    result.body = data.body;

    return result;
  }
}
