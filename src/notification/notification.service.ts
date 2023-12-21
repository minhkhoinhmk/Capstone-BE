import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { NotificationPayload } from './dto/request/notification-payload.dto';
import {
  CLIENT_EMAIL,
  PRIVATE_KEY,
  PROJECT_ID,
} from 'src/common/firebase/firebase.constants';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: PROJECT_ID,
    clientEmail: CLIENT_EMAIL,
    privateKey: PRIVATE_KEY,
  }),
});

@Injectable()
export class NotificationService {
  private logger = new Logger('S3Service', { timestamp: true });

  constructor(private readonly dynamoDBService: DynamodbService) {}

  async sendingNotification(
    notification: NotificationPayload,
  ): Promise<{ success }> {
    const payload = {
      token: notification.token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
    };
    return admin
      .messaging()
      .send(payload)
      .then((res) => {
        // const createNotificationDto = {
        //   title: notification.title,
        //   body: notification.body,
        //   data: notification.data,
        //   userId: notification.userId,
        // };

        // this.dynamoDBService.saveNotification(createNotificationDto);

        this.logger.log(`method=sendingNotification, sent successfully`);
        return {
          success: true,
        };
      })
      .catch((error) => {
        this.logger.log(`method=sendingNotification, error: ${error.message}`);
        return {
          success: false,
        };
      });
  }
}
