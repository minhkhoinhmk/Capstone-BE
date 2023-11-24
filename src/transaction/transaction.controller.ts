import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTrsanctionResponse } from './dto/response/create-transaction.reponse.dto';
import { CreateTransactionRequest } from './dto/request/create-transaction.request.dto';
import { TransactionService } from './transaction.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { FilterTrsanctionResponse } from './dto/response/filter-transaction.response.dto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { Request } from 'express';

@Controller('transaction')
@ApiTags('Transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post('/create')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @ApiCreatedResponse({
    description: 'Create a transaction',
    type: CreateTrsanctionResponse,
  })
  @ApiBody({
    type: CreateTransactionRequest,
  })
  async createTransaction(
    @Body() createTransactionRequest: CreateTransactionRequest,
  ): Promise<CreateTrsanctionResponse> {
    return await this.transactionService.createTransaction(
      createTransactionRequest,
    );
  }

  @Post('/user')
  @ApiPaginatedResponse(FilterTrsanctionResponse)
  @ApiBody({
    type: PageOptionsDto,
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  getTransactionByUserId(
    @Body() pageOption: PageOptionsDto,
    @Req() request: Request,
  ): Promise<PageDto<FilterTrsanctionResponse>> {
    return this.transactionService.getTransactionsByUserId(
      request['user']['id'],
      pageOption,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get transaction by id',
    type: FilterTrsanctionResponse,
  })
  @ApiParam({
    name: 'id',
    description: 'transaction id',
    required: true,
    type: 'string',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  getTransactionByTransactionId(
    @Param('id') transactionId: string,
  ): Promise<FilterTrsanctionResponse> {
    return this.transactionService.getTransactionByTransactionId(transactionId);
  }
}
