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

  @Get()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  @ApiPaginatedResponse(RefundResponse)
  getRefunds(
    @Query('status') status: 'approved' | 'not-approved' | undefined,
  ): Promise<RefundResponse[]> {
    const isApproved = status === undefined ? undefined : status === 'approved';
    return this.refundService.getRefunds(isApproved);
  }

  @ApiOkResponse({
    description: 'Get Refund Successfully',
  })
  @ApiNotFoundResponse({
    description: 'Refund Not Found',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Admin)
  @Get('/:id')
  getRefundById(@Param('id') id: string): Promise<RefundResponse> {
    return this.refundService.getRefundById(id);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/customer/:id')
  getRefundsByCustomerId(@Param('id') id: string): Promise<RefundResponse[]> {
    return this.refundService.getRefundByCustomerId(id);
  }

  @ApiOkResponse({ description: 'Approve refund successfully' })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  @Get('/approve/:id')
  approveRefund(@Param('id') id: string): Promise<void> {
    return this.refundService.approveRefund(id);
  }

  @ApiOkResponse({ description: 'Check refund' })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/isRefund/:id')
  isRefund(@Param('id') orderDetailId: string): Promise<boolean> {
    return this.refundService.checkIsRefund(orderDetailId);
  }

  @ApiOkResponse({ description: 'Question refund' })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  @Get('/ask/question')
  askRefund(
    @Query('id') refundId: string,
    @Query('question') question: string,
  ): Promise<void> {
    return this.refundService.questionRefund(refundId, question);
  }
}
