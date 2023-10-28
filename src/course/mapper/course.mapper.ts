import { Mapper, Mappings } from 'ts-mapstruct';
import { Course } from '../entity/course.entity';
import { FilterCourseByUserResponse } from '../dto/reponse/filter-by-user.dto';

@Mapper()
export class CourseMapper {
  @Mappings()
  filterCourseByUserResponseFromCourse(
    course: Course,
  ): FilterCourseByUserResponse {
    return new FilterCourseByUserResponse();
  }
}
