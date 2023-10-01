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
import { RoleRepository } from 'src/role/role.repository';
import { CustomerRepository } from 'src/customer/customer.repository';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService', { timestamp: true });

  constructor(
    private customerRepository: CustomerRepository,
    private jwtService: JwtService,
    private mailsService: MailerService,
    private roleRepository: RoleRepository,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUpForCustomer(
    customerRegisterRequest: CustomerRegisterRequest,
  ): Promise<CustomerRegisterResponse> {
    const { firstName, lastName, middleName, password, phoneNumber, email } =
      customerRegisterRequest;

    const role = await this.roleRepository.getRoleByName(NameRole.Customer);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const customer = await this.customerRepository.createCustomer(
      customerRegisterRequest,
      role,
      otp,
    );

    try {
      await this.customerRepository.saveCustomer(customer);

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
    const customer = await this.customerRepository.getCustomerByEmail(email);

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
      await this.customerRepository.saveCustomer(customer);
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

  // async getRoleByName(name: NameRole): Promise<Role> {
  //   const role = await this.roleRepository.findOne({
  //     where: { name: name },
  //   });
  //   return role;
  // }

  // async getUserByEmail(email: string): Promise<User> {
  //   const user = await this.userRepository.findOne({
  //     where: { email: email },
  //   });
  //   return user;
  // }

  @Cron('0 0 * * *')
  async deleteNotConfirmedAccount() {
    const customers = await this.customerRepository.getCustomerNotConfirmed();

    for (const customer of customers) {
      this.logger.log(
        `method=deleteNotConfirmedAccount, remove user with id ${customer.id}`,
      );
      await this.customerRepository.removeCustomer(customer);
    }
  }

  async decodeJwtToken(jwt: string): Promise<Object> {
    const payload = this.jwtService.decode(jwt);
    return payload;
  }
}
