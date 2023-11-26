import { CreateQuestionAnswer } from '../dto/dynamodb/create-question-answer.dynamodb.dto';

export class QuestionAnswer {
  questionAnswerId: string;

  body: string;

  static newInstanceFromDynamoDBObject(data: any): QuestionAnswer {
    const result = new QuestionAnswer();
    result.body = data.body.S;
    result.questionAnswerId = data.questionAnswerId.S;

    return result;
  }

  static newInstanceFromDto(data: CreateQuestionAnswer): QuestionAnswer {
    const result = new QuestionAnswer();
    result.questionAnswerId = data.questionAnswerId;
    result.body = data.body;

    return result;
  }
}
