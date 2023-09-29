import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRegisterRequest } from 'src/auth/dto/request/customer-register.request.dto';
import { Role } from 'src/role/entity/role.entity';
import { User } from 'src/user/entity/user.entity';
import { hashPassword } from 'src/utils/hash-password.util';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerRepository {
  private logger = new Logger('CustomerRepository', { timestamp: true });

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getCustomerByEmail(email: string): Promise<User> {
    const customer = await this.userRepository.findOne({
      where: { email: email },
    });
    return customer;
  }

  async saveCustomer(customer: User): Promise<void> {
    await this.userRepository.save(customer);
  }

  async createCustomer(
    customerRegisterRequest: CustomerRegisterRequest,
    role: Role,
    otp: string,
  ): Promise<User> {
    const { firstName, lastName, middleName, password, phoneNumber, email } =
      customerRegisterRequest;

    const user = await this.userRepository.create({
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      password: await hashPassword(password),
      phoneNumber: phoneNumber,
      email: email,
      active: false,
      otpCreatedDate: new Date(),
      otp: otp,
      isConfirmedEmail: false,
      roles: [role],
    });

    return user;
  }

  async getCustomerNotConfirmed(): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('u');

    queryBuilder.where('u.isConfirmedEmail = :isConfirmedEmail', {
      isConfirmedEmail: false,
    });

    queryBuilder.andWhere('u.active = :active', { active: false });

    const customers = await queryBuilder.getMany();

    return customers;
  }

  async removeCustomer(customer: User): Promise<void> {
    await this.userRepository.remove(customer);
  }
}
