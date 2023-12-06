import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { RolesGuard } from 'src/auth/role.guard';
import { PromotionService } from './promotion.service';
import { Request } from 'express';
import Promotion from './entity/promotion.entity';
import { CreatePromotionRequest } from './dto/request/create-promtion-request.dto';
import { User } from 'src/user/entity/user.entity';
import { UpdatePromotionRequest } from './dto/request/update-promtion-request.dto';

@Controller('Promotion')
@ApiTags('Promotion')
export class PromotionController {
  constructor(private promotionService: PromotionService) {}

  @Get()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff, NameRole.Instructor)
  findAll(@Req() request: Request): Promise<Promotion[]> {
    return this.promotionService.getAllPromotionsByUserId(
      request['user']['id'],
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Promotion> {
    return this.promotionService.getPromotionById(id);
  }

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff, NameRole.Instructor)
  @ApiCreatedResponse({ description: `Create Promotion` })
  @ApiBody({ type: CreatePromotionRequest })
  createPromotion(
    @Body() body: CreatePromotionRequest,
    @Req() request: Request,
  ): Promise<void> {
    return this.promotionService.createPromotion(body, request['user'] as User);
  }

  @Put('/:id')
  @ApiOkResponse({ description: `Update Promotion` })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff, NameRole.Instructor)
  @ApiBody({ type: UpdatePromotionRequest })
  updatePromotion(
    @Body() body: UpdatePromotionRequest,
    @Param('id') id: string,
  ): Promise<void> {
    return this.promotionService.updatePromotion(body, id);
  }

  @Delete('/:id')
  @ApiOkResponse({ description: `Delete Promotion` })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff, NameRole.Instructor)
  deletePromotion(@Param('id') id: string): Promise<void> {
    return this.promotionService.removePromotion(id);
  }
}
