import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ACHIEVEMENT_PATH } from 'src/common/s3/s3.constants';
import { CourseRepository } from 'src/course/course.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { S3Service } from 'src/s3/s3.service';
import { UserLecture } from 'src/user-lecture/entity/user-lecture.entity';
import { UserLectureRepository } from 'src/user-lecture/user-lecture.repository';
import { UserRepository } from 'src/user/user.repository';
import { AchievementRepository } from './achievement.repository';
import { AchievementMapper } from './mapper/achievement.mapper';
import { ViewAchievementReponse } from './dto/response/view-achievement-response.dto';
const PDFDocument = require('pdfkit');

@Injectable()
export class AchievementService {
  private logger = new Logger('AchievementService', { timestamp: true });

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly learnerRepository: LearnerRepository,
    private readonly userLectureRepository: UserLectureRepository,
    private readonly courseRepository: CourseRepository,
    private readonly achievementRepository: AchievementRepository,
    private readonly mapper: AchievementMapper,
  ) {}

  async generatePdf(userId: string, courseId: string): Promise<Buffer> {
    if (
      (await this.achievementRepository.getAchievementByCustomerAndCourse(
        userId,
        courseId,
      )) === null &&
      (await this.achievementRepository.getAchievementByLearnerAndCourse(
        userId,
        courseId,
      )) === null
    ) {
      const learner = await this.learnerRepository.getLeanerById(userId);
      const customer = await this.userRepository.getUserById(userId);
      const course = await this.courseRepository.getCourseById(courseId);

      let userLectures: UserLecture[] = [];

      if (learner) {
        userLectures =
          await this.userLectureRepository.getUserLectureByCourseAndLearner(
            courseId,
            learner.id,
          );
      } else if (customer) {
        userLectures =
          await this.userLectureRepository.getUserLectureByCourseAndCustomer(
            courseId,
            customer.id,
          );
      }

      if (userLectures.length === course.chapterLectures.length) {
        const achievement = await this.achievementRepository.createAchievement(
          customer,
          learner,
          course,
        );

        const response = await this.achievementRepository.save(achievement);

        const pdfBuffer: Buffer = await new Promise((resolve) => {
          this.template(
            resolve,
            course.title,
            `${course.user.lastName} ${course.user.middleName} ${course.user.firstName}`,
            learner
              ? `${learner.lastName} ${learner.middleName} ${learner.firstName}`
              : `${customer.lastName} ${customer.middleName} ${customer.firstName}`,
          );
        });

        await this.s3Service.putObject(
          pdfBuffer,
          `${ACHIEVEMENT_PATH}${response.id}.pdf`,
          'application/pdf',
        );

        response.path = `${ACHIEVEMENT_PATH}${response.id}.pdf`;

        await this.achievementRepository.save(response);

        this.logger.log(
          `method=generatePdf, path=${response.path} generated successfully`,
        );

        return pdfBuffer;
      } else {
        throw new InternalServerErrorException(
          `Bạn chưa hoàn thành hết khóa học`,
        );
      }
    } else {
      throw new ConflictException(
        `Chứng nhận hoànn thành khóa học đã được cấp. Vui lòng kiểm ta lại`,
      );
    }
  }

  async getListAchievements(id: string): Promise<ViewAchievementReponse[]> {
    const learner = await this.learnerRepository.getLeanerById(id);
    const customer = await this.userRepository.getUserById(id);
    const response: ViewAchievementReponse[] = [];

    if (learner) {
      const result = await this.achievementRepository.getAchievementByLeaner(
        id,
      );

      result.forEach((achievement) => {
        response.push(
          this.mapper.filterViewAchievementResponseFromAchievement(achievement),
        );
      });
    } else if (customer) {
      const result = await this.achievementRepository.getAchievementByCustomer(
        id,
      );

      result.forEach((achievement) => {
        response.push(
          this.mapper.filterViewAchievementResponseFromAchievement(achievement),
        );
      });
    }

    this.logger.log(`method=getListAchievements, totalSize=${response.length}`);

    return response;
  }

  async getAchievementCertificate(path: string) {
    try {
      const options = {
        Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
        Key: path,
      };

      const s3Object = await this.s3Service.getObject(options);

      this.logger.log(`method=getAchievementCertificate, path=${path}`);

      return s3Object.promise();
    } catch (error) {
      this.logger.log(
        `method=getAchievementCertificate, error=${error.message}`,
      );
      throw new NotFoundException(`Image with path ${path} not found`);
    }
  }

  template(
    resolve,
    courseName: string,
    instructorName: string,
    studentName: string,
  ) {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    // Helper to move to next line
    function jumpLine(doc, lines) {
      for (let index = 0; index < lines; index++) {
        doc.moveDown();
      }
    }

    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');

    doc.fontSize(10);

    // Margin
    const distanceMargin = 0;

    doc
      .fillAndStroke('#0e8cc3')
      .lineWidth(20)
      .lineJoin('round')
      .rect(
        distanceMargin,
        distanceMargin,
        doc.page.width - distanceMargin * 2,
        doc.page.height - distanceMargin * 2,
      )
      .stroke();

    // Header
    const maxWidth = 140;
    const maxHeight = 70;

    doc.image('src/assets/winners.png', doc.page.width / 2 - maxWidth / 2, 60, {
      fit: [maxWidth, maxHeight],
      align: 'center',
    });

    jumpLine(doc, 5);

    doc
      .font('src/fonts/NotoSansJP-Light.otf')
      .fontSize(10)
      .fill('#021c27')
      .text('Vẽ Cùng Trẻ Em', {
        align: 'center',
      });

    jumpLine(doc, 2);

    // Content
    doc
      .font('src/fonts/NotoSansJP-Regular.otf')
      .fontSize(16)
      .fill('#021c27')
      .text('CHỨNG CHỈ HOÀN THÀNH KHÓA HỌC', {
        align: 'center',
      });

    jumpLine(doc, 1);

    doc
      .font('src/fonts/NotoSansJP-Light.otf')
      .fontSize(10)
      .fill('#021c27')
      .text('HỌC SINH', {
        align: 'center',
      });

    jumpLine(doc, 2);

    doc
      .font('src/fonts/NotoSansJP-Bold.otf')
      .fontSize(24)
      .fill('#021c27')
      .text(studentName, {
        align: 'center',
      });

    jumpLine(doc, 1);

    doc
      .font('src/fonts/NotoSansJP-Light.otf')
      .fontSize(10)
      .fill('#021c27')
      .text('Đã xuất sắc hoàn thành khóa học', {
        align: 'center',
      });

    jumpLine(doc, 7);

    doc.lineWidth(1);

    // Signatures
    const lineSize = 174;
    const signatureHeight = 390;

    doc.fillAndStroke('#021c27');
    doc.strokeOpacity(0.2);

    const startLine1 = 240;
    const endLine1 = 240 + lineSize;
    doc
      .moveTo(startLine1, signatureHeight)
      .lineTo(endLine1, signatureHeight)
      .stroke();

    const startLine2 = endLine1 + 32;
    const endLine2 = startLine2 + lineSize;
    doc
      .moveTo(startLine2, signatureHeight)
      .lineTo(endLine2, signatureHeight)
      .stroke();

    doc
      .font('src/fonts/NotoSansJP-Bold.otf')
      .fontSize(10)
      .fill('#021c27')
      .text(instructorName, startLine1, signatureHeight + 10, {
        columns: 1,
        columnGap: 0,
        height: 40,
        width: lineSize,
        align: 'center',
      });

    doc
      .font('src/fonts/NotoSansJP-Light.otf')
      .fontSize(10)
      .fill('#021c27')
      .text('Giáo viên', startLine1, signatureHeight + 25, {
        columns: 1,
        columnGap: 0,
        height: 40,
        width: lineSize,
        align: 'center',
      });

    doc
      .font('src/fonts/NotoSansJP-Bold.otf')
      .fontSize(10)
      .fill('#021c27')
      .text(courseName, startLine2, signatureHeight + 10, {
        columns: 1,
        columnGap: 0,
        height: 40,
        width: lineSize,
        align: 'center',
      });

    doc
      .font('src/fonts/NotoSansJP-Light.otf')
      .fontSize(10)
      .fill('#021c27')
      .text('Khóa học', startLine2, signatureHeight + 25, {
        columns: 1,
        columnGap: 0,
        height: 40,
        width: lineSize,
        align: 'center',
      });

    jumpLine(doc, 4);

    const buffer = [];
    doc.on('data', buffer.push.bind(buffer));
    doc.on('end', () => {
      const data = Buffer.concat(buffer);
      resolve(data);
    });
    doc.end();
  }
}
