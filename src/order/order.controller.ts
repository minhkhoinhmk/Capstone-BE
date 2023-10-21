import { Controller, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { Order } from './entity/order.entity';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @ApiCreatedResponse({
    description: 'Created order successfully',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Post('/create')
  createOrder(): Promise<Order> {
    return this.orderService.createOrder();
  }
}
