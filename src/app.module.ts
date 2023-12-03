import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { User } from './user/entity/user.entity';
import { Post } from './post/entity/post.entity';
import { Role } from './role/entity/role.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { LearnerModule } from './learner/learner.module';
import { Learner } from './learner/entity/learner.entity';
import { JwtStore } from './user/entity/jwt-store.entity';
import { CategoryModule } from './category/category.module';
import { LevelModule } from './level/level.module';
import { ComboModule } from './combo/combo.module';
import { CourseModule } from './course/course.module';
import { PromotionModule } from './promotion/promotion.module';
import { PromotionCourseModule } from './promotion-course/promotion-course.module';
import { CourseFeedbackModule } from './course-feedback/course-feedback.module';
import { ChapterLectureModule } from './chapter-lecture/chapter-lecture.module';
import { Cart } from './cart/entity/cart.entity';
import { CartModule } from './cart/cart.module';
import { CartItem } from './cart-item/entity/cart-item.entity';
import { VideoModule } from './video/video.module';
import { S3Module } from './s3/s3.module';
import { PaymentModule } from './payment/payment.module';
import { Order } from './order/entity/order.entity';
import { OrderDetail } from './order-detail/entity/order-detail.entity';
import { PaymentMethod } from './payment-method/entity/payment-method.entity';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { OrderModule } from './order/order.module';
import { TransactionModule } from './transaction/transaction.module';
import { LearnerCourseModule } from './learner-course/learner-course.module';
import { UserLectureModule } from './user-lecture/user-lecture.module';
import { ImageModule } from './image/image.module';
import { InstructorModule } from './instructor/instructor.module';
import { NotificationModule } from './notification/notification.module';
import { DynamodbModule } from './dynamodb/dynamodb.module';
import { DeviceModule } from './device/device.module';
import { RefundModule } from './refund/refund.module';
import { CourseReportModule } from './course-report/course-report.module';
import { QuestionTopicModule } from './question-topic/question-topic.module';
import { QuestionTopic } from './question-topic/entity/question-topic.entity';
import { TransactionOrderDetailModule } from './transaction-order-detail/transaction-order-detail.module';
import { TransactionPayOffModule } from './transaction-pay-off/transaction-pay-off.module';
import { StaffModule } from './staff/staff.module';
import { QuestionAnswerModule } from './question-answer/question-answer.module';
import { QuestionAnswer } from './question-answer/entity/question-answer.entity';
import { AchievementModule } from './achievement/achievement.module';
import { ContestModule } from './contest/contest.module';
import { CustomerDrawingModule } from './customer-drawing/customer-drawing.module';
import { VoteModule } from './vote/vote.module';
import { WinnerModule } from './winner/winner.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProductions = configService.get('STAGE') === 'prod';
        return {
          ssl: isProductions,
          extra: {
            ssl: isProductions ? { rejectUnauthorized: false } : null,
          },
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
          timezone: 'Asia/Ho_Chi_Minh',
          entities: [
            User,
            Post,
            Role,
            Learner,
            JwtStore,
            Cart,
            CartItem,
            Order,
            OrderDetail,
            PaymentMethod,
            QuestionTopic,
            QuestionAnswer,
          ],
        };
      },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'src/templates/email'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    AuthModule,
    UserModule,
    RoleModule,
    PostModule,
    LearnerModule,
    CategoryModule,
    LevelModule,
    ComboModule,
    CourseModule,
    PromotionModule,
    PromotionCourseModule,
    CourseFeedbackModule,
    ChapterLectureModule,
    CartModule,
    VideoModule,
    S3Module,
    PaymentModule,
    PaymentMethodModule,
    OrderModule,
    TransactionModule,
    LearnerCourseModule,
    UserLectureModule,
    ImageModule,
    InstructorModule,
    NotificationModule,
    DynamodbModule,
    DeviceModule,
    RefundModule,
    CourseReportModule,
    QuestionTopicModule,
    TransactionOrderDetailModule,
    TransactionPayOffModule,
    StaffModule,
    QuestionAnswerModule,
    AchievementModule,
    ContestModule,
    CustomerDrawingModule,
    VoteModule,
    WinnerModule,
  ],
})
export class AppModule {}
