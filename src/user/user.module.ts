import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { JwtStore } from './entity/jwt-store.entity';
import { UserRepository } from './user.repository';
import { JwtStorerRepository } from './jwt-store.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LearnerModule } from 'src/learner/learner.module';
import { RoleModule } from 'src/role/role.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, JwtStore]),
    forwardRef(() => AuthModule),
    forwardRef(() => LearnerModule),
    RoleModule,
  ],
  providers: [UserRepository, JwtStorerRepository, UserService],
  controllers: [UserController],
  exports: [UserRepository, JwtStorerRepository, UserService],
})
export class UserModule {}
