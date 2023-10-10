import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { AddCartItemRequest } from './dto/request/add-cart-item.dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Cart } from './entity/cart.entity';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @ApiCreatedResponse({
    description: 'Added course to cartItem successfully',
  })
  @ApiConflictResponse({
    description: 'Course is already exists in cartItem',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Post('/add')
  addCartItem(@Body() addCartItemRequest: AddCartItemRequest): Promise<void> {
    return this.cartService.addCourseToCartItem(addCartItemRequest);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  getCart(): Promise<Cart> {
    return this.cartService.getCart();
  }

  @ApiParam({
    type: 'string',
    name: 'cartItemId',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Delete(':cartItemId')
  deleteCartItem(@Param('cartItemId') cartItemId: string): Promise<void> {
    return this.cartService.deleteCartItem(cartItemId);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Delete()
  deleteAllCartItem(): Promise<void> {
    return this.cartService.deleteAllCartItems();
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/total')
  getTotalPrice() {
    return this.cartService.getTotalPrice();
  }
}
