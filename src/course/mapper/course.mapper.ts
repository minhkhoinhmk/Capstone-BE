import { Mapper, Mappings } from 'ts-mapstruct';
import { Course } from '../entity/course.entity';
import { FilterCourseByCustomerResponse } from '../dto/reponse/filter-by-customer.dto';
import { FilterCourseByLearnerResponse } from '../dto/reponse/filter-by-learner.dto';

@Mapper()
export class CourseMapper {
  @Mappings()
  filterCourseByCustomerResponseFromCourse(
    course: Course,
  ): FilterCourseByCustomerResponse {
    return new FilterCourseByCustomerResponse();
  }

  @Mappings({ target: 'completedPercent', source: 'percent' })
  filterCourseByLearnerResponseFromCourse(
    course: Course,
    percent: number,
  ): FilterCourseByLearnerResponse {
    return new FilterCourseByLearnerResponse();
  }
}
