import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CustomerRegisterRequest } from './dto/request/customer-register.request.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Token } from './dto/response/token.dto';
import { NameRole } from 'src/role/enum/name-role.enum';
import { CustomerRegisterResponse } from './dto/response/customer-register.response.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron } from '@nestjs/schedule';
import { RoleRepository } from 'src/role/role.repository';
import { GuestLoginRequest } from './dto/request/guest-login.request.dto';
import * as bcrypt from 'bcrypt';
import * as validator from 'validator';
import { JwtStorerRepository } from 'src/user/jwt-store.repository';
import { UserRepository } from 'src/user/user.repository';
import { LearnerRepository } from 'src/learner/learner.repository';

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
  ) {}

  async loginForGuest(guestLoginRequest: GuestLoginRequest): Promise<Token> {
    const { emailOrUsername, password } = guestLoginRequest;

    const valid = await validator.default.isEmail(emailOrUsername);

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
          throw new NotFoundException('User not found');
        }
      }
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.active)
        throw new BadRequestException(`This account is not activated`);

      const tokensAndCount = await this.jwtStoreRepository.getTokenAndCount(
        user.id,
      );
      if (tokensAndCount >= 3)
        throw new BadRequestException(
          `This account is already logged in current 3 devices. Please logout before continue logging in`,
        );

      const payload: JwtPayload = {
        id: user.id,
        username: user.userName,
        email: valid ? emailOrUsername : '',
        role: valid ? NameRole.Customer : NameRole.Learner,
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
        'Please check your email/username and password',
      );
    }
  }

  async signUpForCustomer(
    customerRegisterRequest: CustomerRegisterRequest,
  ): Promise<CustomerRegisterResponse> {
    const { firstName, lastName, middleName, password, phoneNumber, email } =
      customerRegisterRequest;

    const role = await this.roleRepository.getRoleByName(NameRole.Customer);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const customer = await this.userRepository.createCustomer(
      customerRegisterRequest,
      role,
      otp,
    );

    try {
      await this.userRepository.save(customer);

      await this.mailsService.sendMail({
        to: email,
        subject: 'OTP Verification',
        template: './otp',
        context: {
          VERIFICATION_CODE: otp,
        },
      });

      this.logger.log(`method=signUp, Registered email ${email} successfully`);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(`method=signUp, email ${email} already exists`);
        throw new ConflictException('email already exists');
      }
      console.log(error);
    }

    return {
      email: customer.email,
    };
  }

  async confirmCustomer(email: string, otp: string): Promise<void> {
    const customer = await this.userRepository.getUserByEmail(email);

    if (!customer) {
      this.logger.error(`method=confirmCustomer, email ${email} not found`);
      throw new NotFoundException(`email ${email} not found`);
    }

    if (customer.active && customer.isConfirmedEmail) {
      throw new NotFoundException(`Cusomer ${email} is already confirmed`);
    }

    if (customer.otp === otp) {
      this.logger.log(`method=confirmCustomer, account is active`);
      customer.active = true;
      customer.isConfirmedEmail = true;
      await this.userRepository.save(customer);
    } else {
      throw new NotFoundException(`otp ${otp} not found`);
    }
  }

  @Cron('0 0 * * *')
  async deleteNotConfirmedAccount() {
    const customers = await this.userRepository.getUserNotConfirmed();

    for (const customer of customers) {
      this.logger.log(
        `method=deleteNotConfirmedAccount, remove user with id ${customer.id}`,
      );
      await this.userRepository.remove(customer);
    }
  }

  async decodeJwtToken(jwt: string): Promise<Object> {
    const payload = this.jwtService.decode(jwt);
    return payload;
  }

  async logout(code: string): Promise<void> {
    this.logger.log('method=logout, logout successfully');
    this.jwtStoreRepository.removeJwtStoreByCode(code);
  }
}
