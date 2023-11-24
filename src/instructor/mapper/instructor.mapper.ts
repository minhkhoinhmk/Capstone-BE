import { User } from 'src/user/entity/user.entity';
import { Mapper, Mappings } from 'ts-mapstruct';
import { ViewInstructorResponse } from '../dto/response/view-instructor-response.dto';

@Mapper()
export class InstructorMapper {
  @Mappings()
  filterViewInstructorResponseFromInstructor(
    instructor: User,
  ): ViewInstructorResponse {
    return new ViewInstructorResponse();
  }
}
