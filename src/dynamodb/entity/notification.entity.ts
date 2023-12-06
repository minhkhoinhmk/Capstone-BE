import { CreateNotificationRequest } from 'src/dynamodb/dto/create-notification-request.dto';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

export class Notification {
  userId: string;

  title: string;

  body: string;

  data: any;

  createdDate: Date;

  isSeen: boolean;

  static newInstanceFromDynamoDBObject(data: any): Notification {
    const result = new Notification();
    result.title = data.title.S;
    result.body = data.body.S;
    result.createdDate = new Date(Number(data.createdDate.N));
    result.isSeen = data.isSeen.S === 'true';
    result.data = JSON.parse(data.data.S);
    result.userId = data.userId.S;

    return result;
  }

  static newInstanceFromDto(data: CreateNotificationRequest): Notification {
    const result = new Notification();
    result.title = data.title;
    result.body = data.body;
    result.createdDate = dateInVietnam();
    result.isSeen = false;
    result.data = data.data;
    result.userId = data.userId;

    return result;
  }
}
