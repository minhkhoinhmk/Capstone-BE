import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChapterLecture } from './entity/chapter-lecture.entity';

@Module({ imports: [TypeOrmModule.forFeature([ChapterLecture])] })
export class ChapterLectureModule {}
