import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NameRole } from 'src/role/enum/name-role.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoleRepository } from 'src/role/role.repository';
import * as bcrypt from 'bcrypt';
import * as validator from 'validator';
import { JwtStorerRepository } from 'src/user/jwt-store.repository';
import { UserRepository } from 'src/user/user.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { UserUpdateRequest } from './dto/request/user-update.request.dto';
import { LearnerService } from 'src/learner/learner.service';
import { User } from './entity/user.entity';
import { UserChangePasswordRequest } from './dto/request/user-change-password.request.dto';
import { hashPassword } from 'src/utils/hash-password.util';

@Injectable()
export class UserService {
  private logger = new Logger('UserService', { timestamp: true });

  constructor(
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
      throw new BadRequestException('Please check your current password');
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
}
