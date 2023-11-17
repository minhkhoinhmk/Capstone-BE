import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('/profile')
  @ApiConflictResponse({
    description: 'Username was already exists',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  sigup(
    @Body() userUpdateRequest: UserUpdateRequest,
    @Req() request: Request,
  ): Promise<User> {
    return this.userService.updateUser(
      userUpdateRequest,
      request['user'] as User,
    );
  }

  @Post('/profile/change-password')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  changePassword(
    @Body() body: UserChangePasswordRequest,
    @Req() request: Request,
  ): Promise<User> {
    return this.userService.changePasswordUser(body, request['user'] as User);
  }

  @Get('/profile')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  getUserProfile(@Req() request: Request): Promise<User> {
    return this.userService.getUserProfile(request['user'] as User);
  }

  @Post('/profile/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(
    NameRole.Customer,
    NameRole.Admin,
    NameRole.Instructor,
    NameRole.Instructor,
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ): Promise<void> {
    const parts = file.originalname.split('.');

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      return await this.userService.uploadAvatar(
        file.buffer,
        file.mimetype,
        substringAfterDot,
        request['user'] as User,
      );
    }
  }
}
