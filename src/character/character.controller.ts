import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
} from '@nestjs/swagger';

@Controller('character')
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  @Get()
  @ApiOkResponse({
    description: 'Get All Characters Successfully',
    type: Character,
    isArray: true,
  })
  getCharacters(): Promise<Character[]> {
    return this.characterService.getAllCharacters();
  }

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
