import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRegisterRequest } from './dto/request/customer-register.request.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Token } from './dto/response/token.dto';
import { User } from 'src/user/entity/user.entity';
import { Role } from 'src/role/entity/role.entity';
import { NameRole } from 'src/role/enum/name-role.enum';
import { CustomerRegisterResponse } from './dto/response/customer-register.response.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron } from '@nestjs/schedule';
import { hashPassword } from 'src/utils/hash-password.util';

@Injectable()
export class AuthService {
  private logger = new Logger('CharacterService', { timestamp: true });

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private mailsService: MailerService,
  ) {}

  async signUpForCustomer(
    customerRegisterRequest: CustomerRegisterRequest,
  ): Promise<CustomerRegisterResponse> {
    const { firstName, lastName, middleName, password, phoneNumber, email } =
      customerRegisterRequest;

    const role = await this.getRoleByName(NameRole.Customer);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = this.userRepository.create({
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      password: await hashPassword(password),
      phoneNumber: phoneNumber,
      email: email,
      active: false,
      otpCreatedDate: new Date(),
      otp: otp,
      isConfirmedEmail: false,
      roles: [role],
    });

    try {
      await this.userRepository.save(user);

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
      email: user.email,
    };
  }

  async confirmCustomer(email: string, otp: string): Promise<void> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      this.logger.error(`method=confirmCustomer, email ${email} not found`);
      throw new NotFoundException(`email ${email} not found`);
    }

    if (user.active && user.isConfirmedEmail) {
      throw new NotFoundException(`Cusomer ${email} is already confirmed`);
    }

    if (user.otp === otp) {
      this.logger.log(`method=confirmCustomer, account is active`);
      user.active = true;
      user.isConfirmedEmail = true;
      await this.userRepository.save(user);
    } else {
      throw new NotFoundException(`otp ${otp} not found`);
    }
  }

  // async signin(authCredentialsDto: AuthCridentalsDto): Promise<Token> {
  //   const { username, password } = authCredentialsDto;

  //   const user = await this.userRepository.findOne({
  //     where: { username: username },
  //   });

  //   if (user && (await bcrypt.compare(password, user.password))) {
  //     const payload: JwtPayload = { username: username };
  //     const accessToken = await this.jwtService.sign(payload);
  //     this.logger.log(
  //       `method=signin, Login with user name ${username} successfully`,
  //     );
  //     return { accessToken };
  //   } else {
  //     this.logger.error(
  //       `method=signin, user name ${username} can not be authenticated`,
  //     );
  //     throw new UnauthorizedException(
  //       'Please check your username and password',
  //     );
  //   }
  // }

  async getRoleByName(name: NameRole): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: name },
    });
    return role;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    return user;
  }

  @Cron('0 0 * * *')
  async deleteNotConfirmedAccount() {
    const queryBuilder = this.userRepository.createQueryBuilder('u');

    queryBuilder.where('u.isConfirmedEmail = :isConfirmedEmail', {
      isConfirmedEmail: false,
    });

    queryBuilder.andWhere('u.active = :active', { active: false });

    const users = await queryBuilder.getMany();

    for (const user of users) {
      this.logger.log(
        `method=deleteNotConfirmedAccount, remove user with id ${user.id}`,
      );
      await this.userRepository.remove(user);
    }
  }
}
