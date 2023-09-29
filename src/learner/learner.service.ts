import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateLearnerRequest } from './dto/request/create-learner.dto';
import { RoleRepository } from 'src/role/role.repository';
import { CustomerRepository } from 'src/customer/customer.repository';
import { NameRole } from 'src/role/enum/name-role.enum';
import { LearnerRepository } from './learner.repository';

@Injectable()
export class LearnerService {
  private logger = new Logger('LearnerService', { timestamp: true });

  constructor(
    private learnerRepository: LearnerRepository,
    private customerRepository: CustomerRepository,
    private roleRepository: RoleRepository,
  ) {}

  async createLearner(
    createLearnerRequest: CreateLearnerRequest,
  ): Promise<void> {
    const customer = await this.customerRepository.getCustomerByEmail(
      'khoinhmse150853@fpt.edu.vn',
    );

    const role = await this.roleRepository.getRoleByName(NameRole.Learner);

    const learner = await this.learnerRepository.cretaeLearner(
      createLearnerRequest,
      customer,
      role,
    );

    this.logger.log(`method=createLearner, create learner successfully`);

    if (
      (await this.learnerRepository.countLearnerOfEachCustomer(customer)) > 1
    ) {
      this.logger.error(`method=createLearner, learner accounts are full`);
      throw new BadRequestException(`Learner accounts are full`);
    } else {
      try {
        await this.learnerRepository.saveLearner(learner);
      } catch (error) {
        if (error.code === '23505') {
          this.logger.error(
            `method=createLearner, username ${createLearnerRequest.userName} already exists`,
          );
          throw new ConflictException('userName already exists');
        }
        console.log(error);
      }
    }
  }
}
