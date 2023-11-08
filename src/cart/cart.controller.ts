import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
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
  ApiTags,
} from '@nestjs/swagger';
import { Cart } from './entity/cart.entity';
import { User } from 'src/user/entity/user.entity';
import { Request } from 'express';

@Controller('cart')
@ApiTags('Cart')
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
  addCartItem(
    @Body() addCartItemRequest: AddCartItemRequest,
    @Req() request: Request,
  ): Promise<void> {
    return this.cartService.addCourseToCartItem(
      addCartItemRequest,
      request['user'] as User,
    );
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  getCart(@Req() request: Request): Promise<Cart> {
    return this.cartService.getCart(request['user'] as User);
  }

  @ApiParam({
    type: 'string',
    name: 'cartItemId',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Delete(':cartItemId')
  deleteCartItem(
    @Param('cartItemId') cartItemId: string,
    @Req() request: Request,
  ): Promise<void> {
    return this.cartService.deleteCartItem(cartItemId, request['user'] as User);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Delete()
  deleteAllCartItem(@Req() request: Request): Promise<void> {
    return this.cartService.deleteAllCartItems(request['user'] as User);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/total')
  getTotalPrice(@Req() request: Request) {
    return this.cartService.getTotalPrice(request['user'] as User);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/valid')
  checkCartIsValid(@Req() request: Request) {
    return this.cartService.checkCartIsValid(request['user'] as User);
  }
}
