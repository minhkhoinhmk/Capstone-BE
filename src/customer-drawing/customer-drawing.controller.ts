import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CustomerDrawingService } from './customer-drawing.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateCustomerDrawingRequest } from './dto/request/create-customer-drawing-request.dto';
import { CustomerDrawing } from './entity/customer-drawing.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { ViewCustomerDrawingResponse } from './dto/response/view-customer-drawing-response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { FilterCustomerDrawingRequest } from './dto/request/filter-customer-drawing-request.dto';
import { Request } from 'express';
import CustomerDrawingStatus from './enum/customer-drawing-status.enum';
import { User } from 'src/user/entity/user.entity';
import { Learner } from 'src/learner/entity/learner.entity';

@Controller('customer-drawing')
@ApiTags('Customer-Drawing')
export class CustomerDrawingController {
  constructor(
    private readonly customerDrawingService: CustomerDrawingService,
  ) {}

  @Post('/create')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @ApiCreatedResponse({
    description: 'Created Customer Drawing Successfully',
  })
  createCustomerDrawing(
    @Body() ceateCustomerDrawingRequest: CreateCustomerDrawingRequest,
    @Req() request: Request,
    @Query('contestId') contestId: string,
  ): Promise<CustomerDrawing> {
    return this.customerDrawingService.createCustomerDrawing(
      ceateCustomerDrawingRequest,
      contestId,
      request['user']['id'],
    );
  }

  @Get('/submit/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  @ApiOkResponse({
    description: 'Check Customer Drawing Submitted Successfully',
  })
  checkCustomerDrawingSubmitted(
    @Req() request: Request,
    @Param('id') contestId: string,
  ): Promise<boolean> {
    return this.customerDrawingService.checkCustomerDrawingSubmitted(
      contestId,
      request['user']['id'],
    );
  }

  @Put('/image')
  @ApiOkResponse({
    description: 'Uploaded ImageURL Successfully',
  })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Query('customerDrawingId') customerDrawingId: string,
  ): Promise<void> {
    const parts = file.originalname.split('.');

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      return await this.customerDrawingService.uploadImageUrl(
        file.buffer,
        file.mimetype,
        substringAfterDot,
        customerDrawingId,
      );
    }
  }

  @Patch('/approve/:id')
  @HasRoles(NameRole.Staff)
  async setStatusCustomerDrawing(
    @Param('id') id: string,
    @Query('status') status: CustomerDrawingStatus,
  ): Promise<void> {
    return this.customerDrawingService.setStatusCustomerDrawing(id, status);
  }

  @Post('/contest')
  @ApiOkResponse({
    description: 'Get Customer Drawings By Contest Successfully',
  })
  @ApiPaginatedResponse(ViewCustomerDrawingResponse)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Staff, NameRole.Learner)
  @HttpCode(200)
  async getCustomerDrawingsByContest(
    @Req() req: Request,
    @Body() request: FilterCustomerDrawingRequest,
    @Query('contestId') contestId: string,
  ): Promise<PageDto<ViewCustomerDrawingResponse>> {
    return await this.customerDrawingService.getCustomerDrawingByContest(
      contestId,
      request,
      req['user'] as User | Learner,
    );
  }

  @Post('/contest/guest')
  @ApiOkResponse({
    description: 'Get Customer Drawings By Contest Successfully',
  })
  @ApiPaginatedResponse(ViewCustomerDrawingResponse)
  @HttpCode(200)
  async getCustomerDrawingsByContestForGuest(
    @Body() request: FilterCustomerDrawingRequest,
    @Query('contestId') contestId: string,
  ): Promise<PageDto<ViewCustomerDrawingResponse>> {
    return await this.customerDrawingService.getCustomerDrawingByContestForGuest(
      contestId,
      request,
    );
  }

  @Get('/contest/staff')
  @ApiOkResponse({
    description: 'Get Customer Drawings By Contest Successfully',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  @HttpCode(200)
  async getCustomerDrawingsByStaff(
    @Query('contestId') contestId: string,
    @Query('status') status?: CustomerDrawingStatus,
  ): Promise<CustomerDrawing[]> {
    return await this.customerDrawingService.getCustomerDrawingByContestId(
      contestId,
      status,
    );
  }

  @Get('/contest/customer')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  @HttpCode(200)
  async getCustomerDrawingOfCustomerInContest(
    @Query('contestId') contestId: string,
    @Req() request: Request,
  ): Promise<CustomerDrawing[]> {
    return await this.customerDrawingService.getCustomerDrawingOfCustomerInContest(
      request['user'] as User | Learner,
      contestId,
    );
  }

  @Post()
  @ApiOkResponse({
    description: 'Get Customer Drawings Successfully',
  })
  @ApiPaginatedResponse(ViewCustomerDrawingResponse)
  // @UseGuards(AuthGuard(), RolesGuard)
  // @HasRoles(NameRole.Customer, NameRole.Learner)
  @HttpCode(200)
  async getCustomerDrawings(
    @Body() request: FilterCustomerDrawingRequest,
  ): Promise<PageDto<ViewCustomerDrawingResponse>> {
    return await this.customerDrawingService.getCustomerDrawings(request);
  }
}
