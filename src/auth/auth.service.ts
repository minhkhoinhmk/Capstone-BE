import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRegisterRequest } from './dto/request/customer-register.request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Token } from './dto/response/token.dto';
import { User } from 'src/user/entity/user.entity';
import { Role } from 'src/role/entity/role.entity';
import { NameRole } from 'src/role/enum/name-role.enum';
import { CustomerRegisterResponse } from './dto/response/customer-register.response.dto';
import { MailerService } from '@nestjs-modules/mailer';

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

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = await this.getRoleByName(NameRole.Customer);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = this.userRepository.create({
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      password: hashedPassword,
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
}
