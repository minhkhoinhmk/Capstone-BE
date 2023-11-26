import { Mapper, Mappings } from 'ts-mapstruct';
import { QuestionTopicResponse } from '../dto/reponse/question-topic.response.dto';
import { QuestionTopic } from '../entity/question-topic.entity';

@Mapper()
export class QuestionTopicMapper {
  @Mappings({
    target: 'totalLengthQuestionAnswers',
    source: 'lengthQuestionAnswers',
  })
  filterQuestionTopicResponse(
    questionTopic: QuestionTopic,
    lengthQuestionAnswers: number,
  ): QuestionTopicResponse {
    return new QuestionTopicResponse();
  }
  // @Mappings({ target: 'completedPercent', source: 'percent' })
  // filterCourseByLearnerResponseFromCourse(
  //   course: Course,
  //   percent: number,
  // ): FilterCourseByLearnerResponse {
  //   return new FilterCourseByLearnerResponse();
  // }
}
