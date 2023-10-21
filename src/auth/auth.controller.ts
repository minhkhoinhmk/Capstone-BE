import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Token } from './dto/response/token.dto';
import { CustomerRegisterRequest } from './dto/request/customer-register.request.dto';
import { CustomerRegisterResponse } from './dto/response/customer-register.response.dto';
import { GuestLoginRequest } from './dto/request/guest-login.request.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'Created Customer Successfully',
    type: CustomerRegisterResponse,
  })
  @ApiConflictResponse({
    description: 'Email was already exists',
  })
  @Post('/customer/signup')
  sigup(
    @Body() customerRegisterRequest: CustomerRegisterRequest,
  ): Promise<CustomerRegisterResponse> {
    return this.authService.signUpForCustomer(customerRegisterRequest);
  }

  @ApiOkResponse({
    description: 'Confirm Customer Successfully',
  })
  @ApiNotFoundResponse({
    description: 'Otp or email not found',
  })
  @ApiParam({ name: 'email', description: 'Email of customer' })
  @ApiParam({ name: 'otp', description: 'Otp that was recieved from customer' })
  @Get('/customer/confirm')
  confirm(
    @Query('email') email: string,
    @Query('otp') otp: string,
  ): Promise<void> {
    return this.authService.confirmCustomer(email, otp);
  }

  @ApiOkResponse({
    description: 'Login Successfully',
    type: Token,
  })
  @ApiNotFoundResponse({
    description: 'Invalid username or password',
  })
  @Post('/signin')
  signin(
    @Body() guestLoginRequest: GuestLoginRequest,
  ): Promise<{ accessToken: string }> {
    return this.authService.loginForGuest(guestLoginRequest);
  }

  @ApiOkResponse({
    description: 'Logout Successfully',
  })
  @Get('/signout')
  signout(@Query('code') code: string): Promise<void> {
    return this.authService.logout(code);
  }

  @ApiOkResponse({
    description: 'Resend Otp Successfully',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'email', description: 'Email of customer' })
  @Get('/resend')
  resendOtp(@Query('email') email: string): Promise<void> {
    return this.authService.resendOtp(email);
  }
}
