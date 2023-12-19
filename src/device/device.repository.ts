import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './entity/device.entity';
import { Repository } from 'typeorm';
import { CreateDeviceTokenRequest } from './dto/request/create-device-token-request.dto';
import { User } from 'src/user/entity/user.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { NameRole } from 'src/role/enum/name-role.enum';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async createDeviceTokenId(
    learner: Learner,
    user: User,
    request: CreateDeviceTokenRequest,
  ): Promise<Device> {
    return this.deviceRepository.create({
      learner: learner,
      user: user,
      deviceTokenId: request.deviceTokenId,
    });
  }

  async save(device: Device): Promise<void> {
    await this.deviceRepository.save(device);
  }

  async getDeviceByTokenAndUserId(
    userId: string,
    deviceToken: string,
  ): Promise<Device> {
    const queryBuilder = this.deviceRepository.createQueryBuilder('d');

    queryBuilder.where(
      '(d.user.id = :userId OR d.learner.id = :learnerId) AND d.deviceTokenId = :deviceTokenId',
      {
        userId: userId,
        learnerId: userId,
        deviceTokenId: deviceToken,
      },
    );

    const device = await queryBuilder.getOne();

    return device;
  }

  async getDeviceByRole(roleName: NameRole): Promise<Device[]> {
    const device = await this.deviceRepository.find({
      where: {
        user: {
          role: {
            name: roleName,
          },
        },
      },
      relations: {
        user: true,
      },
    });

    return device;
  }

  async getDeviceByUserId(userId: string): Promise<Device[]> {
    const queryBuilder = this.deviceRepository.createQueryBuilder('d');

    queryBuilder.where('(d.user.id = :userId OR d.learner.id = :learnerId)', {
      userId: userId,
      learnerId: userId,
    });

    queryBuilder.leftJoinAndSelect('d.user', 'user');

    const devices = await queryBuilder.getMany();

    return devices;
  }

  async removeDevice(userId: string, deviceToken: string): Promise<void> {
    const device = await this.getDeviceByTokenAndUserId(userId, deviceToken);

    if (device) {
      await this.deviceRepository.remove(device);
    }
  }
}
