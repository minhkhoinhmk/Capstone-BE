import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserRegisterRequest } from './dto/request/customer-register.request.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Token } from './dto/response/token.dto';
import { NameRole } from 'src/role/enum/name-role.enum';
import { CustomerRegisterResponse } from './dto/response/customer-register.response.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoleRepository } from 'src/role/role.repository';
import { GuestLoginRequest } from './dto/request/guest-login.request.dto';
import * as bcrypt from 'bcrypt';
import * as validator from 'validator';
import { JwtStorerRepository } from 'src/user/jwt-store.repository';
import { UserRepository } from 'src/user/user.repository';
import { LearnerRepository } from 'src/learner/learner.repository';
import { DeviceRepository } from 'src/device/device.repository';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService', { timestamp: true });

  constructor(
    private jwtService: JwtService,
    private mailsService: MailerService,
    private roleRepository: RoleRepository,
    private jwtStoreRepository: JwtStorerRepository,
    private userRepository: UserRepository,
    private learnerRepository: LearnerRepository,
    private readonly devicesRepository: DeviceRepository,
  ) {}

  async loginForGuest(guestLoginRequest: GuestLoginRequest): Promise<Token> {
    const { emailOrUsername, password } = guestLoginRequest;

    const valid = validator.default.isEmail(emailOrUsername);

    let user;
    if (valid) {
      user = await this.userRepository.getUserByEmail(emailOrUsername);
    } else {
      user = await this.userRepository.getUserByUserName(emailOrUsername);
      if (!user) {
        user = await this.learnerRepository.getLearnerByUserName(
          emailOrUsername,
        );
        if (!user) {
          throw new NotFoundException(
            'Hãy kiểm tra lại tên đăng nhập/email hoặc mật khẩu của bạn',
          );
          // throw new NotFoundException('User not found');
        }
      }
    }

    // Check user isConfirmedEmail and learner is not check that
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.active || (user.role?.name && !user.isConfirmedEmail))
        throw new BadRequestException(`Tài khoản này vẫn chưa được kích hoạt`);
      // throw new BadRequestException(`This account is not activated`);

      const tokensAndCount = await this.jwtStoreRepository.getTokenAndCount(
        user.id,
      );
      if (tokensAndCount >= 3)
        throw new BadRequestException(
          'Tài khoản này đã đăng nhập trên 3 thiết bị hiện tại. Vui lòng đăng xuất trước khi tiếp tục đăng nhập.',
          // `This account is already logged in current 3 devices. Please logout before continue logging in`,
        );

      const payload: JwtPayload = {
        id: user.id,
        username: user.userName,
        email: valid ? emailOrUsername : '',
        role:
          user.role === NameRole.Learner ? NameRole.Learner : user.role.name,
        fullName: `${user.lastName} ${user.middleName} ${user.firstName}`,
      };

      const accessToken = this.jwtService.sign(payload);

      const jwtStore = await this.jwtStoreRepository.create(
        accessToken,
        user.id,
      );

      await this.jwtStoreRepository.save(jwtStore);
      this.logger.log(
        `method=signin, Login with email/username ${emailOrUsername} successfully`,
      );
      return { accessToken };
    } else {
      this.logger.error(
        `method=signin, email/username ${emailOrUsername} can not be authenticated`,
      );
      throw new UnauthorizedException(
        'Hãy kiểm tra lại tên đăng nhập/email hoặc mật khẩu của bạn',
        // 'Please check your email/username and password',
      );
    }
  }

  async signUp(
    userrRegisterRequest: UserRegisterRequest,
  ): Promise<CustomerRegisterResponse> {
    const { email } = userrRegisterRequest;

    const role = await this.roleRepository.getRoleByName(
      userrRegisterRequest.role,
    );

    const otp = this.createOtp();

    const customer = await this.userRepository.createCustomer(
      userrRegisterRequest,
      role,
      otp,
    );

    try {
      await this.userRepository.save(customer);

      await this.sendEmail(email, otp);

      this.logger.log(
        `method=signUp, Registered email=${email},  role=${userrRegisterRequest.role} successfully`,
      );
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`method=signUp, email ${email} already exists`);
        // throw new ConflictException('email already exists');
        throw new ConflictException('Email đã tồn tại');
      }
    }

    return {
      email: customer.email,
    };
  }

  async confirmUser(email: string, otp: string): Promise<void> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      this.logger.error(`method=confirmUser, email ${email} not found`);
      throw new NotFoundException(`email ${email} not found`);
    }

    if (user.isConfirmedEmail) {
      throw new NotFoundException(`User ${email} is already confirmed`);
    }

    if (user.otp === otp) {
      if (user.role.name === NameRole.Customer) {
        this.logger.log(`method=confirmUser, customer account is active`);
        user.active = true;
        user.isConfirmedEmail = true;
        await this.userRepository.save(user);
      } else if (user.role.name === NameRole.Instructor) {
        this.logger.log(
          `method=confirmCustomer, instructor account is confirmed`,
        );
        user.isConfirmedEmail = true;
        await this.userRepository.save(user);
      }
    } else {
      throw new NotFoundException(`Mã otp ${otp} không đúng`);
    }
  }

  @Cron('0 0 * * *')
  async deleteCustomerNotConfirmedAccount() {
    const customers = await this.userRepository.getCustomerNotConfirmed();

    for (const customer of customers) {
      this.logger.log(
        `method=deleteNotConfirmedAccount, remove user with id ${customer.id}`,
      );
      await this.userRepository.remove(customer);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteInstructorTerminatedSignUp() {
    const instructors =
      await this.userRepository.getInstructorTerminatedSignUp();

    for (const instructor of instructors) {
      this.logger.log(
        `method=deleteInstructorTerminatedSignUp, remove user with id ${instructor.id}`,
      );
      await this.userRepository.remove(instructor);
    }
  }

  @Cron('0 0 * * *')
  async deleteInstructorRejected() {
    const instructors = await this.userRepository.getInstructorRejected();

    for (const instructor of instructors) {
      this.logger.log(
        `method=deleteInstructorRejected, remove user with id ${instructor.id}`,
      );
      await this.userRepository.remove(instructor);
    }
  }

  async logout(code: string, deviceToken?: string): Promise<void> {
    this.logger.log('method=logout, logout successfully');
    const decoded = this.jwtService.verify(code);
    this.logger.log('method=logout decoded 1');
    await this.jwtStoreRepository.removeJwtStoreByCode(code);
    this.logger.log('method=logout decoded 2', decoded);
    await this.devicesRepository.removeDevice(decoded.id, deviceToken);
    this.logger.log('method=logout decoded 3');
  }

  async resendOtp(email: string): Promise<void> {
    const otp = this.createOtp();

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    user.otp = otp;

    await this.userRepository.save(user);

    await this.sendEmail(email, otp);

    this.logger.log(
      `method=resendOtp, resend otp successfully, email: ${email}`,
    );
  }

  createOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmail(email: string, otp: string): Promise<void> {
    await this.mailsService.sendMail({
      to: email,
      subject: 'OTP Verification',
      template: './otp',
      context: {
        VERIFICATION_CODE: otp,
      },
    });
  }

  async checkToekenExpired(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      return decoded.exp > currentTimestamp;
    } catch (error) {
      return false;
    }
  }
}
