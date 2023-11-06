import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationPayload } from './dto/request/notification-payload.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notifocationService: NotificationService) {}

  @Post('/send')
  async sendNotidication(@Body() body: NotificationPayload) {
    return await this.notifocationService.sendingNotification(body);
  }
}
