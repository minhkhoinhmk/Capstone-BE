import { Mapper, Mappings } from 'ts-mapstruct';
import { Course } from '../entity/course.entity';
import { FilterCourseByCustomerResponse } from '../dto/reponse/filter-by-customer.dto';
import { FilterCourseByLearnerResponse } from '../dto/reponse/filter-by-learner.dto';
import { FilterCourseByInstructorResponse } from '../dto/reponse/filter-by-instructor.dto';
import { FilterCourseByStaffResponse } from '../dto/reponse/filter-by-staff.dt';

@Mapper()
export class CourseMapper {
  @Mappings({ target: 'completedPercent', source: 'percent' })
  @Mappings({ target: 'isCertified', source: 'isCertified' })
  @Mappings({ target: 'ratedStar', source: 'ratedStar' })
  @Mappings({ target: 'feedbackDescription', source: 'feedbackDescription' })
  filterCourseByCustomerResponseFromCourse(
    course: Course,
    percent: number,
    isCertified: boolean,
    ratedStar: number | null,
    feedbackDescription: string | null,
  ): FilterCourseByCustomerResponse {
    return new FilterCourseByCustomerResponse();
  }

  @Mappings({ target: 'completedPercent', source: 'percent' })
  @Mappings({ target: 'isCertified', source: 'isCertified' })
  @Mappings({ target: 'ratedStar', source: 'ratedStar' })
  @Mappings({ target: 'feedbackDescription', source: 'feedbackDescription' })
  filterCourseByLearnerResponseFromCourse(
    course: Course,
    percent: number,
    isCertified: boolean,
    ratedStar: number | null,
    feedbackDescription: string | null,
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
