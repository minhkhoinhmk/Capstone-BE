import { Injectable, Logger } from '@nestjs/common';
import {
  COURSE_PATH,
  INSTRUCTOR_CERTIFICATION_PATH,
} from 'src/common/s3/s3.constants';
import { UploadStatus } from 'src/s3/dto/upload-status.dto';
import { S3Service } from 'src/s3/s3.service';
import { UserRepository } from 'src/user/user.repository';
import { InstructorStatus } from './enum/instructor-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationPayload } from 'src/notification/dto/request/notification-payload.dto';

@Injectable()
export class InstructorService {
  private logger = new Logger('InstructorService', { timestamp: true });

  constructor(
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async uploadCertification(
    buffer: Buffer,
    substringAfterDot: string,
    email: string,
    type: string,
  ): Promise<UploadStatus> {
    try {
      const user = await this.userRepository.getUserByEmail(email);
      const key = `${INSTRUCTOR_CERTIFICATION_PATH}${user.id}.${substringAfterDot}`;

      await this.s3Service.putObject(buffer, key, type);

      user.certificateUrl = key;
      user.status = InstructorStatus.Pending;
      await this.userRepository.save(user);

      const payload = {
        token:
          'fMawqyJNHXeUNXEDF_M90C:APA91bFT32pRONbXyfIS698O6EeFs3OLXmqMFkPeVYWzlTcJPIDNObb4vRT7lll1nQ5X8bOttXpgutEYUAgeI9C8Lkir2jG8Nzn_TuDwpq0kkAKc9ihzHa0wSDIlsgKUCLm685GlQSeQ',
        title: 'Cập nhật bằng cấp',
        body: 'Một giáo viên vừa cập nhật bằng cấp. Hãy xét duyệtt!',
        data: {
          certificationUrl: key,
        },
      };

      this.notificationService.sendingNotification(payload);

      this.logger.log(
        `method=uploadCertification, uploadCertification succeed`,
      );
      return { staus: true };
    } catch (error) {
      this.logger.error(
        `method=uploadCertification, uploadCertification failed: ${error.message}`,
      );
      return { staus: false };
    }
  }
}
