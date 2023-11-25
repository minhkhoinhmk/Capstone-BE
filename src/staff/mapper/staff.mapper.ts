import { User } from 'src/user/entity/user.entity';
import { Mapper, Mappings } from 'ts-mapstruct';
import { ViewStaffrResponse } from '../dto/response/view-staff-resonse.dto';

@Mapper()
export class StaffMapper {
  @Mappings()
  filterViewStaffResponseFromStaff(staff: User): ViewStaffrResponse {
    return new ViewStaffrResponse();
  }
}
