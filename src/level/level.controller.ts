import { Controller, Get, Param, Query } from '@nestjs/common';
import Level from './entity/level.entity';
import { LevelService } from './level.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('level')
@ApiTags('Level')
export class LevelController {
  constructor(private levelService: LevelService) {}

  @Get()
  findAll(@Query('active') active: string): Promise<Level[]> {
    return this.levelService.getAllLevels(active);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Level> {
    return this.levelService.getLevelById(id);
  }
}
