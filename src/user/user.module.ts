import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { JwtStore } from './entity/jwt-store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, JwtStore])],
})
export class UserModule {}
