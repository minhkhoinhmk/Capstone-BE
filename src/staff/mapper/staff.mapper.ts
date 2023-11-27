import { User } from 'src/user/entity/user.entity';
import { Mapper, Mappings } from 'ts-mapstruct';
import { ViewStaffResponse } from '../dto/response/view-staff-response.dto';

@Mapper()
export class StaffMapper {
  @Mappings()
  filterViewStaffResponseFromStaff(staff: User): ViewStaffResponse {
    return new ViewStaffResponse();
  }
}
