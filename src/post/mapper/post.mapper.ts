import { Mapper, Mappings } from 'ts-mapstruct';
import { PostResponse } from '../dto/reponse/post.response.dto';

@Mapper()
export class PostMapper {
  @Mappings()
  filterPostResponse(post: PostResponse): PostResponse {
    return new PostResponse();
  }
  // @Mappings({ target: 'completedPercent', source: 'percent' })
  // filterCourseByLearnerResponseFromCourse(
  //   course: Course,
  //   percent: number,
  // ): FilterCourseByLearnerResponse {
  //   return new FilterCourseByLearnerResponse();
  // }
}
