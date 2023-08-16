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
import { CreateCharacterDto } from './entity/create-character.dto';

@Controller('character')
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  @Get()
  getCharacters(): Promise<Character[]> {
    return this.characterService.getAllCharacters();
  }

  @Post()
  createCharacter(
    @Body() createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    return this.characterService.createCharacter(createCharacterDto);
  }

  @Get('/:id')
  getCharacterById(@Param('id') id: string): Promise<Character> {
    return this.characterService.getCharacterById(id);
  }

  @Delete('/:id')
  deleteCharacter(@Param('id') id: string): Promise<void> {
    return this.characterService.deleteCharacterById(id);
  }

  @Patch('/:id')
  updateCharacter(
    @Param('id') id: string,
    @Body() createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    return this.characterService.updateCharacter(id, createCharacterDto);
  }
}
