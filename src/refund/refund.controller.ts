import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RefundService } from './refund.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { CreateRefundRequest } from './dto/request/create-refund-request.dto';
import { RefundResponse } from './dto/response/refund-response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';

@Controller('refund')
@ApiTags('Refund')
export class RefundController {
  constructor(private refundService: RefundService) {}

  @ApiCreatedResponse({
    description: 'Created Refund Successfully',
  })
  @ApiConflictResponse({
    description: 'Refund was existed',
  })
  @ApiBadRequestResponse({
    description: 'User studied more than 20%',
  })
  @ApiBody({
    type: CreateRefundRequest,
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Post('/create')
  createRefund(
    @Query('orderDetailId') orderDetailId: string,
    @Body() request: CreateRefundRequest,
  ): Promise<void> {
    return this.refundService.createRefund(request, orderDetailId);
  }

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  @ApiPaginatedResponse(RefundResponse)
  getRefunds(
    @Body() pageOption: PageOptionsDto,
    @Query('isApproved') isApproved: boolean,
  ): Promise<PageDto<RefundResponse>> {
    return this.refundService.getRefunds(pageOption, isApproved);
  }

  @ApiOkResponse({
    description: 'Get Refund Successfully',
  })
  @ApiNotFoundResponse({
    description: 'Refund Not Found',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Staff)
  @Get('/:id')
  getRefundById(@Param('id') id: string): Promise<RefundResponse> {
    return this.refundService.getRefundById(id);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Post('/customer/:id')
  getRefundsByCsutomerId(
    @Body() pageOption: PageOptionsDto,
    @Param('id') id: string,
  ): Promise<PageDto<RefundResponse>> {
    return this.refundService.getRefundByCustomerId(id, pageOption);
  }

  @ApiOkResponse({ description: 'Approve refund successfully' })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  @Get('/approve/:id')
  approveRefund(@Param('id') id: string): Promise<void> {
    return this.refundService.approveRefund(id);
  }
}
