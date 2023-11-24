import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Order } from './entity/order.entity';
import { UpdateTransactionRequest } from './dto/request/update-order.request.dto';
import { Request } from 'express';
import { User } from 'src/user/entity/user.entity';

@Controller('order')
@ApiTags('Order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('/create')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @ApiCreatedResponse({
    description: 'Created order successfully',
  })
  createOrder(@Req() request: Request): Promise<Order> {
    return this.orderService.createOrder(request['user'] as User);
  }

  @Patch('/update')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  updateOrder(@Body() body: UpdateTransactionRequest): Promise<Order> {
    return this.orderService.updateOrder(body);
  }

  @Get('/user')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  findOrdersByUser(@Req() request: Request): Promise<Order[]> {
    return this.orderService.findOrdersByUser(request['user'] as User);
  }

  @Get('/user/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  findOrderByOrderId(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<Order> {
    return this.orderService.findOrderByOrderId(id, request['user'] as User);
  }
}
