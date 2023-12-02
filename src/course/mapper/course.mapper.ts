import { Mapper, Mappings } from 'ts-mapstruct';
import { Course } from '../entity/course.entity';
import { FilterCourseByCustomerResponse } from '../dto/reponse/filter-by-customer.dto';
import { FilterCourseByLearnerResponse } from '../dto/reponse/filter-by-learner.dto';
import { FilterCourseByInstructorResponse } from '../dto/reponse/filter-by-instructor.dto';
import { FilterCourseByStaffResponse } from '../dto/reponse/filter-by-staff.dt';

@Mapper()
export class CourseMapper {
  @Mappings({ target: 'completedPercent', source: 'percent' })
  filterCourseByCustomerResponseFromCourse(
    course: Course,
    percent: number,
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

  @Mappings()
  filterCourseByInstructorResponseFromCourse(
    course: Course,
  ): FilterCourseByInstructorResponse {
    return new FilterCourseByInstructorResponse();
  }

  @Mappings()
  filterCourseByStaffResponseFromCourse(
    course: Course,
  ): FilterCourseByStaffResponse {
    return new FilterCourseByStaffResponse();
  }
}
