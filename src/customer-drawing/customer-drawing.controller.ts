import {
  Body,
  Controller,
  HttpCode,
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
  createContest(
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

  @Post('/contest')
  @ApiOkResponse({
    description: 'Get Customer Drawings By Contest Successfully',
  })
  @ApiPaginatedResponse(ViewCustomerDrawingResponse)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @HttpCode(200)
  async getCustomerDrawingsByContest(
    @Body() request: FilterCustomerDrawingRequest,
    @Query('contestId') contestId: string,
  ): Promise<PageDto<ViewCustomerDrawingResponse>> {
    return await this.customerDrawingService.getCustomerDrawingByContest(
      contestId,
      request,
    );
  }

  @Post()
  @ApiOkResponse({
    description: 'Get Customer Drawings Successfully',
  })
  @ApiPaginatedResponse(ViewCustomerDrawingResponse)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @HttpCode(200)
  async getCustomerDrawings(
    @Body() request: FilterCustomerDrawingRequest,
  ): Promise<PageDto<ViewCustomerDrawingResponse>> {
    return await this.customerDrawingService.getCustomerDrawings(request);
  }
}
