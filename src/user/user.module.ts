import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { FilesModule } from 'src/files/files.module';
@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([User]), FilesModule],
})
export class UserModule {}
