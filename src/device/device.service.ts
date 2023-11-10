import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { DeviceRepository } from './device.repository';
import { CreateDeviceTokenRequest } from './dto/request/create-device-token-request.dto';
import { UserRepository } from 'src/user/user.repository';
import { LearnerRepository } from 'src/learner/learner.repository';

@Injectable()
export class DeviceService {
  private logger = new Logger('DeviceService', { timestamp: true });

  constructor(
    private deviceRepository: DeviceRepository,
    private readonly userRepository: UserRepository,
    private readonly learnerRepository: LearnerRepository,
  ) {}

  async saveDevice(
    userId: string,
    request: CreateDeviceTokenRequest,
  ): Promise<void> {
    const user = await this.userRepository.getUserById(userId);

    const learner = await this.learnerRepository.getLeanerById(userId);

    if (
      !(await this.deviceRepository.getDeviceByTokenAndUserId(
        userId,
        request.deviceTokenId,
      ))
    ) {
      const device = await this.deviceRepository.createDeviceTokenId(
        learner,
        user,
        request,
      );
      await this.deviceRepository.save(device);
    } else {
      throw new ConflictException(
        `Device with userId ${userId} and tokenDeviceId ${request.deviceTokenId} already exists`,
      );
    }
  }
}
