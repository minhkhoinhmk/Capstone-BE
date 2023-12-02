import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChapterLecture } from './entity/chapter-lecture.entity';
import { ChapterLectureService } from './chapter-lecture.service';
import { ChapterLectureController } from './chapter-lecture.controller';
import { ChapterLectureRepository } from './chapter-lecture.repository';
import { UserLectureModule } from 'src/user-lecture/user-lecture.module';
import { ChapterLectureMapper } from './mapper/chapter-lecture.mapper';
import { AuthModule } from 'src/auth/auth.module';
import { LearnerModule } from 'src/learner/learner.module';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/course/course.module';
import { S3Module } from 'src/s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import { VideoModule } from 'src/video/video.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChapterLecture]),
    forwardRef(() => UserLectureModule),
    forwardRef(() => AuthModule),
    forwardRef(() => LearnerModule),
    UserModule,
    forwardRef(() => CourseModule),
    S3Module,
    ConfigModule,
    VideoModule,
  ],
  providers: [
    ChapterLectureService,
    ChapterLectureRepository,
    ChapterLectureMapper,
  ],
  controllers: [ChapterLectureController],
  exports: [ChapterLectureRepository],
})
export class ChapterLectureModule {}
