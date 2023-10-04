import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { JwtStore } from './entity/jwt-store.entity';
import { UserRepository } from './user.repository';
import { JwtStorerRepository } from './jwt-store.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, JwtStore])],
  providers: [UserRepository, JwtStorerRepository],
  exports: [UserRepository, JwtStorerRepository],
})
export class UserModule {}
