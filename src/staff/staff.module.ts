import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { UserModule } from 'src/user/user.module';
import { RoleModule } from 'src/role/role.module';
import { AuthModule } from 'src/auth/auth.module';
import { StaffController } from './staff.controller';
import { StaffMapper } from './mapper/staff.mapper';

@Module({
  providers: [StaffService, StaffMapper],
  controllers: [StaffController],
  imports: [UserModule, RoleModule, AuthModule],
})
export class StaffModule {}
