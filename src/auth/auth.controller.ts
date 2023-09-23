import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
    description: 'User name was already exists',
  })
  @Post('/customer/signup')
  sigup(
    @Body() customerRegisterRequest: CustomerRegisterRequest,
  ): Promise<CustomerRegisterResponse> {
    return this.authService.signUpForCustomer(customerRegisterRequest);
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
