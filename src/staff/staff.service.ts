import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { RoleRepository } from 'src/role/role.repository';
import { UserRepository } from 'src/user/user.repository';
import { CreateStaffRequest } from './dto/request/create-staff-request.dto';
import { ViewStaffrResponse } from './dto/response/view-staff-resonse.dto';
import { StaffMapper } from './mapper/staff.mapper';
import { UpdateStaffProfileRequest } from './dto/request/update-profile-request.dto';

@Injectable()
export class StaffService {
  private logger = new Logger('StaffService', { timestamp: true });

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly mapper: StaffMapper,
  ) {}

  async createStaff(request: CreateStaffRequest): Promise<void> {
    try {
      const role = await this.roleRepository.getRoleByName(request.role);

      const staff = await this.userRepository.createStaff(request, role);

      await this.userRepository.save(staff);

      this.logger.log(`method=createStaff, staff created successfully`);
    } catch (error) {
      throw new ConflictException(
        `Staff with userName ${request.userName} existed`,
      );
    }
  }

  async getStaffs(): Promise<ViewStaffrResponse[]> {
    const staffs = await this.userRepository.getStaff();

    let response: ViewStaffrResponse[] = [];

    staffs.forEach((staff) => {
      response.push(this.mapper.filterViewStaffResponseFromStaff(staff));
    });

    return response;
  }

  async getStaffById(id: string): Promise<ViewStaffrResponse> {
    const staff = await this.userRepository.getUserById(id);

    return this.mapper.filterViewStaffResponseFromStaff(staff);
  }

  async updateStaffProfile(
    staffId: string,
    request: UpdateStaffProfileRequest,
  ): Promise<void> {
    const staff = await this.userRepository.getUserById(staffId);

    staff.firstName = request.firstName;
    staff.lastName = request.lastName;
    staff.middleName = request.middleName;
    staff.phoneNumber = request.phoneNumber;

    await this.userRepository.save(staff);
  }

  async removeStaff(staffId: string): Promise<void> {
    const staff = await this.userRepository.getUserById(staffId);

    staff.active = false;

    await this.userRepository.save(staff);
  }
}
