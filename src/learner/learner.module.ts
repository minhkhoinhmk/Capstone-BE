import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Learner } from './entity/learner.entity';
import { LearnerService } from './learner.service';
import { LearnerController } from './learner.controller';
import { RoleModule } from 'src/role/role.module';
import { LearnerRepository } from './learner.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Learner]),
    RoleModule,
    forwardRef(() => AuthModule),
    UserModule,
  ],
  providers: [LearnerService, LearnerRepository],
  controllers: [LearnerController],
  exports: [LearnerRepository],
})
export class LearnerModule {}
