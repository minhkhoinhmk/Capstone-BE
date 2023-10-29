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

@Module({
  imports: [
    TypeOrmModule.forFeature([ChapterLecture]),
    forwardRef(() => UserLectureModule),
    forwardRef(() => AuthModule),
    forwardRef(() => LearnerModule),
    UserModule,
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
