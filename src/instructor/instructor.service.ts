import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { CourseStatus } from 'src/course/type/enum/CourseStatus';
import { UpdateCourseRequest } from 'src/course/dto/request/update-course-request.dto';
import { UpdatePriceCourseRequest } from 'src/course/dto/request/update-price-course-request.dto';
import { UpdateBankRequest } from './dto/request/update-bank-request.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ViewInstructorResponse } from './dto/response/view-instructor-response.dto';
import { InstructorMapper } from './mapper/instructor.mapper';
import { SetInstructorStatusRequest } from './dto/request/set-instructor-status-request.dto';
import { UpdateInstructorProfileRequest } from './dto/request/update-profile-request.dto';
import { GetCourseByInstructorRequest } from './dto/request/get-course-by-instructor.request.dto';

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
    private mailsService: MailerService,
    private mapper: InstructorMapper,
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

      await this.mailsService.sendMail({
        to: user.email,
        subject: 'Chờ xét duyệt',
        template: './waitingApproval',
        context: {
          CONTENT: 'Thông tin đang chờ xét duyệt',
        },
      });

      console.log('alo 21356');

      this.logger.log(
        `method=uploadCertification, uploadCertification succeed`,
      );
      return { status: true };
    } catch (error) {
      this.logger.error(
        `method=uploadCertification, uploadCertification failed: ${error.message}`,
      );
      return { status: false };
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
      course.title = createCourseRequest.title;
      course.level = level;
      course.category = category;
      course.user = instructor;
      course.active = false;
      course.status = CourseStatus.CREATED;

      this.logger.log(`method=createCourse, created course successfully`);

      return await this.courseRepository.saveCourse(course);
    } catch (error) {
      this.logger.log(`method=createCourse, failed to create course`);

      throw new NotFoundException(
        `Category with id ${createCourseRequest.categoryId} or level with id ${createCourseRequest.levelId} not found`,
      );
    }
  }

  async updateCourse(
    body: UpdateCourseRequest,
    userId: string,
  ): Promise<Course> {
    try {
      const { courseId, categoryId, levelId, ...otherUpdateFields } = body;

      const level = await this.levelRepository.getLevelById(levelId);
      const category = await this.categoryRepository.getCategoryById(
        categoryId,
      );
      let course = await this.courseRepository.getCourseById(courseId);

      if (!level || !category || !course) throw new Error();

      if (level) course.level = level;
      if (category) course.category = category;
      course = { ...course, ...otherUpdateFields };

      this.logger.log(`method=updateCourse, update course successfully`);

      return await this.courseRepository.saveCourse(course);
    } catch (error) {
      this.logger.log(`method=updateCourse, failed to update course`);

      throw new NotFoundException(
        `Category with id ${body.categoryId} or level with id ${body.levelId} or course with id ${body.courseId} not found`,
      );
    }
  }

  async updatePriceCourse(
    body: UpdatePriceCourseRequest,
    userId: string,
  ): Promise<Course> {
    try {
      const { courseId, price } = body;

      const course = await this.courseRepository.getCourseById(courseId);
      if (!course) throw new Error();
      course.price = price;

      this.logger.log(`method=updatePriceCourse, update course successfully`);

      return await this.courseRepository.saveCourse(course);
    } catch (error) {
      this.logger.log(`method=updatePriceCourse, failed to update course`);

      throw new NotFoundException(`course with id ${body.courseId} not found`);
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

      const course = await this.courseRepository.getCourseById(courseId);
      course.thumbnailUrl = key;

      await this.courseRepository.saveCourse(course);

      await this.s3Service.putObject(buffer, key, type);

      this.logger.log(
        `method=uploadThumbnail, uploaded thumbnail successfully`,
      );
    } catch (error) {
      this.logger.log(`method=uploadThumbnail, error: ${error.message}`);
    }
  }

  async getCoursesByInstructorId(
    id: string,
    body: GetCourseByInstructorRequest,
  ): Promise<PageDto<FilterCourseByInstructorResponse>> {
    const { count, entities } =
      await this.courseRepository.getCoursesByInstructorId(id, body);

    const responses: FilterCourseByInstructorResponse[] = [];

    for (const course of entities) {
      responses.push(
        this.courseMapper.filterCourseByInstructorResponseFromCourse(course),
      );
    }

    const itemCount = count;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: body.pageOptions,
    });

    this.logger.log(`method=getCoursesByInstructorId, totalItems=${count}`);

    return new PageDto(responses, pageMetaDto);
  }

  async updateBankForInstructor(
    email: string,
    request: UpdateBankRequest,
  ): Promise<void> {
    const instructor = await this.userRepository.getUserByEmail(email);

    if (!instructor) {
      throw new NotFoundException(`Instructor with email=${email} not found`);
    } else {
      instructor.accountNumber = request.accountNumber;
      instructor.bank = request.bank;
      instructor.accountHolderName = request.accountHolderName;

      await this.userRepository.save(instructor);

      this.logger.log(
        `method=updateBankForInstructor, Updated bank successfully`,
      );
    }
  }

  async getInstructors(
    status?: InstructorStatus,
  ): Promise<ViewInstructorResponse[]> {
    const response: ViewInstructorResponse[] = [];

    const instructors = await this.userRepository.getInstructors(status);

    instructors.forEach((instructor) => {
      response.push(
        this.mapper.filterViewInstructorResponseFromInstructor(instructor),
      );
    });

    this.logger.log(`method=getInstructors, total items = ${response.length}`);

    return response;
  }

  async getInstructorById(id: string): Promise<ViewInstructorResponse> {
    const instructor = await this.userRepository.getUserById(id);

    if (!instructor) {
      throw new NotFoundException(`User ${id} does not found`);
    } else {
      this.logger.log(
        `method=getInstructorById, instructor with id ${id} found`,
      );

      return this.mapper.filterViewInstructorResponseFromInstructor(instructor);
    }
  }

  async setInstructorSatus(request: SetInstructorStatusRequest): Promise<void> {
    const instructor = await this.userRepository.getUserById(
      request.instructorId,
    );

    if (request.status === InstructorStatus.Reject) {
      if (!request.reason) {
        throw new BadRequestException('Reason can not be null');
      }
    }

    instructor.status = request.status;
    instructor.reason = request.reason;

    if (request.status === InstructorStatus.Reject) {
      instructor.active = false;
      await this.mailsService.sendMail({
        to: instructor.email,
        subject: 'Từ chối đăng ký giáo viên',
        template: './reject',
        context: {
          SUBJECT: 'giáo viên',
          NAME: `${instructor.lastName} ${instructor.middleName} ${instructor.firstName}`,
          REASON: request.reason,
        },
      });
    } else if (request.status === InstructorStatus.Approved) {
      instructor.active = true;
      await this.mailsService.sendMail({
        to: instructor.email,
        subject: 'Đồng ý xét duyệt',
        template: './approve',
        context: {
          SUBJECT: 'đăng ký xét duyệt giáo viên',
          CONTENT: 'Đã được chấp thuận',
        },
      });
    }

    this.userRepository.save(instructor);

    this.logger.log(
      `method=setInstructorSatus, set status instructor with id=${request.instructorId} successfully`,
    );
  }

  async updateInstructorProfile(
    instructorId: string,
    request: UpdateInstructorProfileRequest,
  ): Promise<void> {
    const instructor = await this.userRepository.getUserById(instructorId);

    instructor.firstName = request.firstName;
    instructor.lastName = request.lastName;
    instructor.middleName = request.middleName;
    instructor.phoneNumber = request.phoneNumber;
    instructor.bank = request.bank;
    instructor.accountNumber = request.accountNumber;
    instructor.accountHolderName = request.accountHolderName;

    await this.userRepository.save(instructor);
  }
}
