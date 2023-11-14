import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  COURSE_THUMBNAIL_PATH,
  INSTRUCTOR_CERTIFICATION_PATH,
} from 'src/common/s3/s3.constants';
import { UploadStatus } from 'src/s3/dto/upload-status.dto';
import { S3Service } from 'src/s3/s3.service';
import { UserRepository } from 'src/user/user.repository';
import { InstructorStatus } from './enum/instructor-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { CategoryRepository } from 'src/category/category.repository';
import { LevelRepository } from 'src/level/level.repository';
import { CreateCourseRequest } from 'src/course/dto/request/create-course-request.dto';
import { Course } from 'src/course/entity/course.entity';
import { CourseRepository } from 'src/course/course.repository';
import { DeviceRepository } from 'src/device/device.repository';
import { NameRole } from 'src/role/enum/name-role.enum';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { FilterCourseByInstructorResponse } from 'src/course/dto/reponse/filter-by-instructor.dto';
import { CourseMapper } from 'src/course/mapper/course.mapper';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';

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
    private readonly deviceRepository: DeviceRepository,
    private readonly courseMapper: CourseMapper,
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

      const tokens = await this.deviceRepository.getDeviceByRole(
        NameRole.Admin,
      );

      tokens.forEach((token) => {
        console.log(token);
        const payload = {
          token: token.deviceTokenId,
          title: 'Cập nhật bằng cấp',
          body: 'Một giáo viên vừa cập nhật bằng cấp. Hãy xét duyệtt!',
          data: {
            certificationUrl: key,
          },
          userId: token.user.id,
        };

        this.notificationService.sendingNotification(payload);
      });

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
    userId: string,
  ): Promise<Course> {
    try {
      const level = await this.levelRepository.getLevelById(
        createCourseRequest.levelId,
      );
      const category = await this.categoryRepository.getCategoryById(
        createCourseRequest.categoryId,
      );
      const instructor = await this.userRepository.getUserById(userId);

      const course = new Course();
      (course.title = createCourseRequest.title),
        (course.level = level),
        (course.category = category);
      course.user = instructor;

      this.logger.log(`method=createCourse, created course successfully`);

      return await this.courseRepository.saveCourse(course);
    } catch (error) {
      this.logger.log(`method=createCourse, failed to create course`);

      throw new NotFoundException(
        `Category with id ${createCourseRequest.categoryId} or level with id ${createCourseRequest.levelId} not found`,
      );
    }
  }

  async uploadThumbnail(
    buffer: Buffer,
    type: string,
    substringAfterDot: string,
    courseId: string,
  ): Promise<void> {
    try {
      const key = `${COURSE_THUMBNAIL_PATH}${courseId}.${substringAfterDot}`;

      let course = await this.courseRepository.getCourseById(courseId);
      course.thumbnailUrl = key;

      await this.courseRepository.saveCourse(course);

      await this.s3Service.putObject(buffer, key, type);

      this.logger.log(`method=uploadThumbnail, uploaed thumbnail successfully`);
    } catch (error) {
      this.logger.log(`method=uploadThumbnail, error: ${error.message}`);
    }
  }

  async getCoursesByInstructorId(
    id: string,
    pageOption: PageOptionsDto,
  ): Promise<PageDto<FilterCourseByInstructorResponse>> {
    const { count, entities } =
      await this.courseRepository.getCoursesByInstructorId(id, pageOption);

    let responses: FilterCourseByInstructorResponse[] = [];

    for (const course of entities) {
      responses.push(
        this.courseMapper.filterCourseByInstructorResponseFromCourse(course),
      );
    }

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOption,
    });

    this.logger.log(`method=getCoursesByInstructorId, totalItems=${count}`);

    return new PageDto(responses, pageMetaDto);
  }
}
