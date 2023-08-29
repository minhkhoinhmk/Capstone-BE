import { Body, Controller, Post } from '@nestjs/common';
import { AuthCridentalsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  sigup(@Body() authCridentalsDto: AuthCridentalsDto): Promise<void> {
    return this.authService.signUp(authCridentalsDto);
  }

  @Post('/signin')
  signin(
    @Body() authCridentalsDto: AuthCridentalsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signin(authCridentalsDto);
  }
}
