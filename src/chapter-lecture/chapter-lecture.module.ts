import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChapterLecture } from './entity/chapter-lecture.entity';
import { ChapterLectureService } from './chapter-lecture.service';
import { ChapterLectureController } from './chapter-lecture.controller';
import { ChapterLectureRepository } from './chapter-lecture.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChapterLecture])],
  providers: [ChapterLectureService, ChapterLectureRepository],
  controllers: [ChapterLectureController],
})
export class ChapterLectureModule {}
