import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Learner } from './entity/learner.entity';
import { LearnerService } from './learner.service';
import { LearnerController } from './learner.controller';
import { RoleModule } from 'src/role/role.module';
import { CustomerModule } from 'src/customer/customer.module';
import { LearnerRepository } from './learner.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Learner]), RoleModule, CustomerModule],
  providers: [LearnerService, LearnerRepository],
  controllers: [LearnerController],
})
export class LearnerModule {}