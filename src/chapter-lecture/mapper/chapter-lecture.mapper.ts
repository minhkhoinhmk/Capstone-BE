import { Mapper, Mappings } from 'ts-mapstruct';
import { ChapterLecture } from '../entity/chapter-lecture.entity';
import { LearnerChapterResponse } from '../dto/response/learner-chapter-reponse.dto';
import { ChapterLectureService } from '../chapter-lecture.service';

@Mapper()
export class ChapterLectureMapper {
  @Mappings({
    target: 'isCompleted',
    source: 'isCompleted',
  })
  LearnerChapterResponseFromChapterLecture(
    chapterLecture: ChapterLecture,
    isCompleted: boolean,
  ): LearnerChapterResponse {
    return new LearnerChapterResponse();
  }
}
