import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Token } from './dto/response/token.dto';
import { CustomerRegisterRequest } from './dto/request/customer-register.request.dto';
import { CustomerRegisterResponse } from './dto/response/customer-register.response.dto';

@Controller('auth')
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

  // @ApiOkResponse({
  //   description: 'Created Characters Successfully',
  //   type: Token,
  // })
  // @ApiNotFoundResponse({
  //   description: 'Invalid username or password',
  // })
  // @Post('/signin')
  // signin(
  //   @Body() authCridentalsDto: AuthCridentalsDto,
  // ): Promise<{ accessToken: string }> {
  //   return this.authService.signin(authCridentalsDto);
  // }
}
