import { Injectable, Logger } from '@nestjs/common';
import { DynamodbRepository } from './dynamodb.repository';
import { CreateNotificationRequest } from 'src/dynamodb/dto/create-notification-request.dto';
import { Notification } from './entity/notification.entity';

@Injectable()
export class DynamodbService {
  private logger = new Logger('DynamodbService', { timestamp: true });

  constructor(private readonly dynamodbRepository: DynamodbRepository) {}

  async saveNotification(notification: CreateNotificationRequest) {
    try {
      await this.dynamodbRepository.createNotification(
        Notification.newInstanceFromDto(notification),
      );
      this.logger.log(
        `method=saveNotification, saved notification successfully`,
      );
    } catch (error) {
      this.logger.error(`method=saveNotification, error: ${error.message}`);
    }
  }

  async getNotificationByUserId(userId: string): Promise<Notification[]> {
    try {
      const responses = await this.dynamodbRepository.findByUserId(userId);
      this.logger.log(
        `method=getNotificationByUserId, total: ${responses.length}`,
      );

      return responses;
    } catch (error) {
      this.logger.error(
        `method=getNotificationByUserId, error: ${error.message}`,
      );
    }
  }

  async updateIsSeen(userId: string, createdDate: string): Promise<void> {
    try {
      await this.dynamodbRepository.updateIsSeen(createdDate, userId);
      this.logger.log(`method=updateIsSeen, userId: ${userId}`);
    } catch (error) {
      this.logger.error(`method=updateIsSeen, error: ${error.message}`);
    }
  }
}
