import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStaffRequest } from './dto/request/create-staff-request.dto';
import { RolesGuard } from 'src/auth/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ViewStaffrResponse } from './dto/response/view-staff-resonse.dto';
import { UpdateStaffProfileRequest } from './dto/request/update-profile-request.dto';
import { Request } from 'express';

@Controller('staff')
@ApiTags('Staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('/create')
  @ApiCreatedResponse({
    description: 'Create staff',
  })
  @ApiBody({ type: CreateStaffRequest })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  async createStaff(@Body() request: CreateStaffRequest): Promise<void> {
    return await this.staffService.createStaff(request);
  }

  @Get()
  @ApiOkResponse({
    description: 'Get staffs',
    type: ViewStaffrResponse,
    isArray: true,
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  async getStaffs(): Promise<ViewStaffrResponse[]> {
    return await this.staffService.getStaffs();
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Get staff by id',
    type: ViewStaffrResponse,
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  async getStaffById(@Param('id') id: string): Promise<ViewStaffrResponse> {
    return await this.staffService.getStaffById(id);
  }

  @Get('/profile/view')
  @ApiOkResponse({
    description: 'View staff profile',
    type: ViewStaffrResponse,
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  async viewStaffProfile(@Req() request: Request): Promise<ViewStaffrResponse> {
    return await this.staffService.getStaffById(request['user']['id']);
  }

  @Put('/profile/update')
  @ApiOkResponse({
    description: 'Update staff',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  async updateStaffProfile(
    @Req() req: Request,
    @Body() request: UpdateStaffProfileRequest,
  ): Promise<void> {
    return await this.staffService.updateStaffProfile(
      req['user']['id'],
      request,
    );
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'Delete staff',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  async deleteStaff(@Param('id') id: string): Promise<void> {
    return await this.staffService.removeStaff(id);
  }
}
