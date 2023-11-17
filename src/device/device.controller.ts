import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { CreateDeviceTokenRequest } from './dto/request/create-device-token-request.dto';
import { Request } from 'express';

@Controller('device')
@ApiTags('Device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('/save')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(
    NameRole.Admin,
    NameRole.Instructor,
    NameRole.Staff,
    NameRole.Customer,
    NameRole.Learner,
  )
  saveDevice(@Req() request: Request, @Body() body: CreateDeviceTokenRequest) {
    return this.deviceService.saveDevice(request['user']['id'], body);
  }
}
