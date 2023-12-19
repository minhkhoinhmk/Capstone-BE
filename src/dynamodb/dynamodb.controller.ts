import { Controller, Get, Put, Query, Req, UseGuards } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('dynamodb')
@ApiTags('Notification')
export class DynamodbController {
  constructor(private readonly dynamoService: DynamodbService) {}

  @Get('/notifications')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(
    NameRole.Admin,
    NameRole.Instructor,
    NameRole.Staff,
    NameRole.Customer,
    NameRole.Learner,
  )
  getNotifications(@Req() request: Request, @Query('size') size: number) {
    return this.dynamoService.getNotificationByUserId(
      request['user']['id'],
      size,
    );
  }

  @Put('/notification/seen')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(
    NameRole.Admin,
    NameRole.Instructor,
    NameRole.Staff,
    NameRole.Customer,
    NameRole.Learner,
  )
  updateIsSeen(
    @Req() request: Request,
    @Query('createdDate') createdDate: string,
  ) {
    return this.dynamoService.updateIsSeen(request['user']['id'], createdDate);
  }
}
