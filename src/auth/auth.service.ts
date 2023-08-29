import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCridentalsDto } from './dto/auth-credentials.dto';
import { Role } from './enum/role.enum';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  private logger = new Logger('CharacterService', { timestamp: true });

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(authCridentalsDto: AuthCridentalsDto): Promise<void> {
    const { username, password } = authCridentalsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      role: Role.USER,
    });

    try {
      await this.userRepository.save(user);
      this.logger.log(
        `method=signUp, Registered user name ${username} successfully`,
      );
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(
          `method=signUp, user name ${username} already exists`,
        );
        throw new ConflictException('user name already exists');
      }
      console.log(error);
    }
  }

  async signin(
    authCredentialsDto: AuthCridentalsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;

    const user = await this.userRepository.findOne({
      where: { username: username },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username: username };
      const accessToken = await this.jwtService.sign(payload);
      this.logger.log(
        `method=signin, Login with user name ${username} successfully`,
      );
      return { accessToken };
    } else {
      this.logger.error(
        `method=signin, user name ${username} can not be authenticated`,
      );
      throw new UnauthorizedException(
        'Please check your username and password',
      );
    }
  }
}
