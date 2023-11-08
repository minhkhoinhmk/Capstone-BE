import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserUpdateRequest } from './dto/request/user-update.request.dto';
import { UserUpdateResponse } from './dto/response/user-update.response.dto';
import { Request } from 'express';
import { User } from './entity/user.entity';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { UserChangePasswordRequest } from './dto/request/user-change-password.request.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiConflictResponse({
    description: 'Username was already exists',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Patch('/profile')
  sigup(
    @Body() userUpdateRequest: UserUpdateRequest,
    @Req() request: Request,
  ): Promise<User> {
    return this.userService.updateUser(
      userUpdateRequest,
      request['user'] as User,
    );
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Post('/profile/change-password')
  changePassword(
    @Body() body: UserChangePasswordRequest,
    @Req() request: Request,
  ): Promise<User> {
    return this.userService.changePasswordUser(body, request['user'] as User);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/profile')
  getUserProfile(@Req() request: Request): Promise<User> {
    return this.userService.getUserProfile(request['user'] as User);
  }
}
