import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLecture } from './entity/user-lecture.entity';
import { UserLectureService } from './user-lecture.service';
import { UserLectureRepository } from './user-lecture.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserLecture])],
  providers: [UserLectureService, UserLectureRepository],
  exports: [UserLectureRepository],
})
export class UserLectureModule {}
