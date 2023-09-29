import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { CustomerRepository } from './customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [CustomerRepository],
  exports: [CustomerRepository],
})
export class CustomerModule {}
