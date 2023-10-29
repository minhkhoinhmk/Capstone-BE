import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLecture } from './entity/user-lecture.entity';
import { UserLectureService } from './user-lecture.service';
import { UserLectureRepository } from './user-lecture.repository';
import { ChapterLectureModule } from 'src/chapter-lecture/chapter-lecture.module';
import { LearnerModule } from 'src/learner/learner.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserLectureController } from './user-lecture.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLecture]),
    forwardRef(() => ChapterLectureModule),
    forwardRef(() => LearnerModule),
    UserModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UserLectureService, UserLectureRepository],
  exports: [UserLectureRepository],
  controllers: [UserLectureController],
})
export class UserLectureModule {}
