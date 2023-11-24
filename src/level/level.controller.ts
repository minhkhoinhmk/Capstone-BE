import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import Level from './entity/level.entity';
import { LevelService } from './level.service';
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
import { CreateLevelRequest } from './dto/request/create-level-request.dto';

@Controller('level')
@ApiTags('Level')
export class LevelController {
  constructor(private levelService: LevelService) {}

  @Get()
  findAll(@Query('active') active: string): Promise<Level[]> {
    return this.levelService.getAllLevels(active);
  }

  @Get('/admin')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  findAllByAdmin(): Promise<Level[]> {
    return this.levelService.getAllLevelsByAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Level> {
    return this.levelService.getLevelById(id);
  }

  @Post()
  @ApiCreatedResponse({ description: `Create level` })
  @ApiBody({ type: CreateLevelRequest })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  createLevel(@Body() body: CreateLevelRequest): Promise<void> {
    return this.levelService.createLevel(body);
  }

  @Patch('/:id')
  @ApiOkResponse({ description: `Update level` })
  @ApiBody({ type: CreateLevelRequest })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  updateLevel(
    @Body() body: CreateLevelRequest,
    @Param('id') id: string,
  ): Promise<void> {
    return this.levelService.updateLevel(id, body);
  }

  @Delete('/:id')
  @ApiOkResponse({ description: `Delete level` })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  deleteLevel(@Param('id') id: string): Promise<void> {
    return this.levelService.removeLevel(id);
  }
}
