import {
  ConflictException,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { RoleRepository } from 'src/role/role.repository';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/user/user.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { UserUpdateRequest } from './dto/request/user-update.request.dto';
import { LearnerService } from 'src/learner/learner.service';
import { User } from './entity/user.entity';
import { UserChangePasswordRequest } from './dto/request/user-change-password.request.dto';
import { hashPassword } from 'src/utils/hash-password.util';
import { USER_AVATAR_PATH } from 'src/common/s3/s3.constants';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class UserService {
  private logger = new Logger('UserService', { timestamp: true });

  constructor(
    private readonly s3Service: S3Service,
    private userRepository: UserRepository,
    // private mailsService: MailerService,
    // private jwtService: JwtService,
    // private jwtStoreRepository: JwtStorerRepository,
    // private userRepository: UserRepository,
    private learnerRepository: LearnerRepository,
    private learnerService: LearnerService,
    private roleRepository: RoleRepository,
  ) {}

  async updateUser(body: UserUpdateRequest, user: User) {
    if (
      body.userName &&
      body.userName !== user.userName &&
      (await this.learnerService.checkUsernameIsExist(body.userName))
    ) {
      this.logger.error(
        `method=updateUser, userName=${body.userName} was existed`,
      );
      throw new ConflictException('User name already exists');
    }

    return this.userRepository.updateUser(user, body);
  }

  async changePasswordUser(body: UserChangePasswordRequest, user: User) {
    const { currentPassword, newPassword } = body;

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      this.logger.error(
        `method=changePasswordUser, currentPassword=${currentPassword} not correct`,
      );
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    const hashNewPassword = await hashPassword(newPassword);
    return await this.userRepository.updateUser(
      user,
      undefined,
      hashNewPassword,
    );
  }

  async getUserProfile(user: User) {
    return user;
  }

  async uploadAvatar(
    buffer: Buffer,
    type: string,
    substringAfterDot: string,
    user: User,
  ): Promise<void> {
    try {
      const key = `${USER_AVATAR_PATH}${user.id}${substringAfterDot}`;

      user.avatar = key;

      await this.userRepository.save(user);

      await this.s3Service.putObject(buffer, key, type);

      this.logger.log(
        `method=uploadAvatar, uploaded avatar user successfully uploaded`,
      );
    } catch (error) {
      this.logger.log(`method=uploadThumbnail, error:${error.message}`);
    }
  }

  async getCustomers(): Promise<User[]> {
    return await this.userRepository.getCustomers();
  }

  async getCustomersById(id: string): Promise<User> {
    return await this.userRepository.getUserById(id);
  }
}
