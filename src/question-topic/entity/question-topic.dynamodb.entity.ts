import { CreateQuestionTopic } from '../dto/dynamodb/create-question-topic.dynamodb.dto';

export class QuestionTopic {
  questionTopicId: string;

  body: string;

  static newInstanceFromDynamoDBObject(data: any): QuestionTopic {
    const result = new QuestionTopic();
    result.body = data.body.S;
    result.questionTopicId = data.questionTopicId.S;

    return result;
  }

  static newInstanceFromDto(data: CreateQuestionTopic): QuestionTopic {
    const result = new QuestionTopic();
    result.questionTopicId = data.questionTopicId;
    result.body = data.body;

    return result;
  }
}
