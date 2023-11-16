import { Mapper, Mappings } from 'ts-mapstruct';
import { CourseReport } from '../entity/course-report.entity';
import { CourseReportResponse } from '../dto/response/report-reponse.dto';

@Mapper()
export class CourseReportMapper {
  @Mappings(
    { target: 'firstName', source: 'courseReport.user.firstName' },
    { target: 'middleName', source: 'courseReport.user.middleName' },
    { target: 'lastName', source: 'courseReport.user.lastName' },
    { target: 'userNameOrEmail', source: 'courseReport.user.email' },
  )
  filterCourseReportResponseFromCourseReportWithUser(
    courseReport: CourseReport,
  ): CourseReportResponse {
    return new CourseReportResponse();
  }

  @Mappings(
    { target: 'firstName', source: 'courseReport.learner.firstName' },
    { target: 'middleName', source: 'courseReport.learner.middleName' },
    { target: 'lastName', source: 'courseReport.learner.lastName' },
    { target: 'userNameOrEmail', source: 'courseReport.learner.userName' },
  )
  filterCourseReportResponseFromCourseReportWithLearner(
    courseReport: CourseReport,
  ): CourseReportResponse {
    return new CourseReportResponse();
  }
}
