import { Mapper, Mappings } from 'ts-mapstruct';
import { QuestionAnswer } from '../entity/question-answer.entity';
import { QuestionAnswerResponse } from '../dto/reponse/question-answer.response.dto';

@Mapper()
export class QuestionAnswerMapper {
  @Mappings()
  filterQuestionAnswerResponse(
    questionAnswer: QuestionAnswer,
  ): QuestionAnswerResponse {
    return new QuestionAnswerResponse();
  }
  // @Mappings({ target: 'completedPercent', source: 'percent' })
  // filterCourseByLearnerResponseFromCourse(
  //   course: Course,
  //   percent: number,
  // ): FilterCourseByLearnerResponse {
  //   return new FilterCourseByLearnerResponse();
  // }
}
