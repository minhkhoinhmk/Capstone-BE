import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { FindOptionsRelations, IsNull, Repository } from 'typeorm';
import { hashPassword } from 'src/utils/hash-password.util';
import { Role } from 'src/role/entity/role.entity';
import { UserRegisterRequest } from 'src/auth/dto/request/customer-register.request.dto';
import { UserUpdateRequest } from './dto/request/user-update.request.dto';
import { NameRole } from 'src/role/enum/name-role.enum';
import { InstructorStatus } from 'src/instructor/enum/instructor-status.enum';
import { CreateStaffRequest } from 'src/staff/dto/request/create-staff-request.dto';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        role: true,
        learners: true,
      },
    });
    return user;
  }

  async getUserByRole(roleName: NameRole): Promise<User[]> {
    const user = await this.userRepository.find({
      where: { role: { name: roleName }, active: true },
      relations: {
        role: true,
      },
    });
    return user;
  }

  async getUserByIdWithRelation(
    id: string,
    relations: FindOptionsRelations<User>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
    });
    return user;
  }

  async getUserByUserName(userName: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userName },
      relations: { role: true },
    });
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const customer = await this.userRepository.findOne({
      where: { email: email },
      relations: { role: true },
    });
    return customer;
  }

  async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async createCustomer(
    customerRegisterRequest: UserRegisterRequest,
    role: Role,
    otp: string,
  ): Promise<User> {
    const { firstName, lastName, middleName, password, phoneNumber, email } =
      customerRegisterRequest;

    const user = this.userRepository.create({
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      password: await hashPassword(password),
      phoneNumber: phoneNumber,
      email: email,
      active: false,
      otpCreatedDate: dateInVietnam(),
      otp: otp,
      isConfirmedEmail: false,
      role: role,
    });

    return user;
  }

  async createStaff(
    createStaffRequest: CreateStaffRequest,
    role: Role,
  ): Promise<User> {
    const { firstName, lastName, middleName, password, phoneNumber, userName } =
      createStaffRequest;

    const staff = this.userRepository.create({
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      password: await hashPassword(password),
      phoneNumber: phoneNumber,
      userName: userName,
      active: true,
      isConfirmedEmail: true,
      role: role,
    });

    return staff;
  }

  async getCustomerNotConfirmed(): Promise<User[]> {
    const customers = await this.userRepository.find({
      where: {
        role: { name: NameRole.Customer },
        isConfirmedEmail: false,
        active: false,
      },
    });

    return customers;
  }

  async getInstructorTerminatedSignUp(): Promise<User[]> {
    const instructors = await this.userRepository.find({
      where: {
        role: { name: NameRole.Instructor },
        active: false,
        status: IsNull(),
      },
    });

    return instructors;
  }

  async getInstructorRejected(): Promise<User[]> {
    const instructors = await this.userRepository.find({
      where: {
        role: { name: NameRole.Instructor },
        active: false,
        status: InstructorStatus.Reject,
      },
    });

    return instructors;
  }

  async remove(user: User): Promise<void> {
    await this.userRepository.remove(user);
  }

  async updateUser(
    user: User,
    body?: UserUpdateRequest,
    password?: string,
  ): Promise<User> {
    body && Object.assign(user, body);
    password && (user.password = password);
    return this.save(user);
  }

  async getInstructors(status?: InstructorStatus): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: { name: NameRole.Instructor }, status },
    });
  }

  async getStaffs(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: { name: NameRole.Staff } },
    });
  }

  async getCustomers(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: { name: NameRole.Customer } },
    });
  }
}
