import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entity/device.entity';
import { UserModule } from 'src/user/user.module';
import { DeviceRepository } from './device.repository';
import { AuthModule } from 'src/auth/auth.module';
import { LearnerModule } from 'src/learner/learner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    UserModule,
    AuthModule,
    LearnerModule,
  ],
  providers: [DeviceService, DeviceRepository],
  controllers: [DeviceController],
  exports: [DeviceRepository],
})
export class DeviceModule {}
