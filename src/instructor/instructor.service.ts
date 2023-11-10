import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { CategoryRepository } from 'src/category/category.repository';
import { LevelRepository } from 'src/level/level.repository';
import { CreateCourseRequest } from 'src/course/dto/request/create-course-request.dto';
import { Course } from 'src/course/entity/course.entity';
import { CourseRepository } from 'src/course/course.repository';

@Injectable()
export class InstructorService {
  private logger = new Logger('InstructorService', { timestamp: true });

  constructor(
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
    private readonly categoryRepository: CategoryRepository,
    private readonly levelRepository: LevelRepository,
    private readonly courseRepository: CourseRepository,
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
        userId: user.id,
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

  async createCourse(
    createCourseRequest: CreateCourseRequest,
  ): Promise<Course> {
    try {
      const level = await this.levelRepository.getLevelById(
        createCourseRequest.levelId,
      );
      const category = await this.categoryRepository.getCategoryById(
        createCourseRequest.categoryId,
      );

      const course = new Course();
      (course.title = createCourseRequest.title),
        (course.level = level),
        (course.category = category);

      this.logger.log(`method=createCourse, created course successfully`);

      return await this.courseRepository.saveCourse(course);
    } catch (error) {
      this.logger.log(`method=createCourse, failed to create course`);

      throw new NotFoundException(
        `Category with id ${createCourseRequest.categoryId} or level with id ${createCourseRequest.levelId} not found`,
      );
    }
  }
}
