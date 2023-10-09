import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Character } from './entity/character.entity';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';

@Controller('character')
@ApiTags('Character')
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  @Get()
  @ApiQuery({
    name: 'isActive',
    description: 'Is Active field to filter',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: 'integer',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: 'integer',
    required: false,
  })
  getCharacters(
    @Query('isActive') isActive: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<Character>> {
    const options: IPaginationOptions = {
      limit,
      page,
    };

    return this.characterService.getAllCharacters(options, isActive);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  @Post()
  @ApiCreatedResponse({
    description: 'Created Characters Successfully',
    type: Character,
  })
  createCharacter(
    @Body() createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    return this.characterService.createCharacter(createCharacterDto);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Admin)
  @ApiParam({ name: 'id', description: 'Id of character' })
  @ApiOkResponse({
    description: 'Get Character By ID Successfully',
    type: Character,
  })
  @ApiNotFoundResponse({
    description: 'Character not found',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get('/:id')
  getCharacterById(@Param('id') id: string): Promise<Character> {
    return this.characterService.getCharacterById(id);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  @ApiParam({ name: 'id', description: 'Id of character' })
  @ApiOkResponse({
    description: 'Delete Character Successfully',
  })
  @ApiNotFoundResponse({
    description: 'Character not found',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Delete('/:id')
  deleteCharacter(@Param('id') id: string): Promise<void> {
    return this.characterService.deleteCharacterById(id);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Admin)
  @ApiParam({ name: 'id', description: 'Id of character' })
  @ApiOkResponse({
    description: 'Update Character By ID Successfully',
    type: Character,
  })
  @ApiNotFoundResponse({
    description: 'Character not found',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Patch('/:id')
  updateCharacter(
    @Param('id') id: string,
    @Body() createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    return this.characterService.updateCharacter(id, createCharacterDto);
  }
}
