import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { hashPassword } from 'src/utils/hash-password.util';
import { Role } from 'src/role/entity/role.entity';
import { CustomerRegisterRequest } from 'src/auth/dto/request/customer-register.request.dto';

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
        roles: true,
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
    });
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const customer = await this.userRepository.findOne({
      where: { email: email },
    });
    return customer;
  }

  async save(user: User): Promise<void> {
    await this.userRepository.save(user);
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

  async getUserNotConfirmed(): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('u');

    queryBuilder.where('u.isConfirmedEmail = :isConfirmedEmail', {
      isConfirmedEmail: false,
    });

    queryBuilder.andWhere('u.active = :active', { active: false });

    const customers = await queryBuilder.getMany();

    return customers;
  }

  async remove(user: User): Promise<void> {
    await this.userRepository.remove(user);
  }
}
