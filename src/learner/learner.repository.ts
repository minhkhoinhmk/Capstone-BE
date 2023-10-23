import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Learner } from './entity/learner.entity';
import { Repository } from 'typeorm';
import { CreateLearnerRequest } from './dto/request/create-learner.dto';
import { User } from 'src/user/entity/user.entity';
import { Role } from 'src/role/entity/role.entity';
import { hashPassword } from 'src/utils/hash-password.util';

@Injectable()
export class LearnerRepository {
  private logger = new Logger('LearnerRepository', { timestamp: true });

  constructor(
    @InjectRepository(Learner)
    private learnerRepository: Repository<Learner>,
  ) {}

  async cretaeLearner(
    createLearnerRequest: CreateLearnerRequest,
    customer: User,
    role: Role,
  ): Promise<Learner> {
    const { firstName, lastName, middleName, userName, password } =
      createLearnerRequest;

    const learner = await this.learnerRepository.create({
      firstName,
      lastName,
      middleName,
      userName,
      password: await hashPassword(password),
      active: true,
      user: customer,
      role,
    });

    return learner;
  }

  async saveLearner(learner: Learner): Promise<void> {
    await this.learnerRepository.save(learner);
  }

  async countLearnerOfEachCustomer(customer: User): Promise<number> {
    const [list, count] = await this.learnerRepository.findAndCount({
      where: { user: customer },
    });

    return count;
  }

  async getLeanerById(id: string): Promise<Learner> {
    const learner = await this.learnerRepository.findOne({
      where: { id },
      relations: {
        role: true,
      },
    });
    return learner;
  }

  async getLearnerByUserName(userName: string): Promise<Learner> {
    const learner = await this.learnerRepository.findOne({
      where: { userName },
    });
    return learner;
  }

  async getLearnerByUserId(userId: string): Promise<Learner[]> {
    const learner = await this.learnerRepository.find({
      where: { user: { id: userId }, active: true },
    });
    return learner;
  }
}
