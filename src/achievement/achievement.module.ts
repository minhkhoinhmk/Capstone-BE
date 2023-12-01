import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { S3Module } from 'src/s3/s3.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entity/achievement.entity';
import { LearnerModule } from 'src/learner/learner.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { UserLectureModule } from 'src/user-lecture/user-lecture.module';
import { CourseModule } from 'src/course/course.module';
import { AchievementRepository } from './achievement.repository';
import { AchievementMapper } from './mapper/achievement.mapper';

@Module({
  imports: [
    S3Module,
    ConfigModule,
    TypeOrmModule.forFeature([Achievement]),
    LearnerModule,
    AuthModule,
    UserModule,
    UserLectureModule,
    CourseModule,
  ],
  providers: [
    AchievementService,
    ConfigService,
    AchievementRepository,
    AchievementMapper,
  ],
  controllers: [AchievementController],
})
export class AchievementModule {}
