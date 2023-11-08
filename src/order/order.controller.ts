import {
  Body,
  Controller,
  Get,
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

  @ApiCreatedResponse({
    description: 'Created order successfully',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Post('/create')
  createOrder(@Req() request: Request): Promise<Order> {
    return this.orderService.createOrder(request['user'] as User);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Patch('/update')
  updateOrder(@Body() body: UpdateTransactionRequest): Promise<Order> {
    return this.orderService.updateOrder(body);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/user')
  findOrdersByUser(@Req() request: Request): Promise<Order[]> {
    return this.orderService.findOrdersByUser(request['user'] as User);
  }
}
