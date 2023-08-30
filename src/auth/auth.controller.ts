import { Body, Controller, Post } from '@nestjs/common';
import { AuthCridentalsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Token } from './dto/token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'Created Characters Successfully',
  })
  @ApiConflictResponse({
    description: 'User name was already exists',
  })
  @Post('/signup')
  sigup(@Body() authCridentalsDto: AuthCridentalsDto): Promise<void> {
    return this.authService.signUp(authCridentalsDto);
  }

  @ApiOkResponse({
    description: 'Created Characters Successfully',
    type: Token,
  })
  @ApiNotFoundResponse({
    description: 'Invalid username or password',
  })
  @Post('/signin')
  signin(
    @Body() authCridentalsDto: AuthCridentalsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signin(authCridentalsDto);
  }
}
