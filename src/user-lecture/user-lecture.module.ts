import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLecture } from './entity/user-lecture.entity';

@Module({ imports: [TypeOrmModule.forFeature([UserLecture])] })
export class UserLectureModule {}
