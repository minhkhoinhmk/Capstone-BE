import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from './entity/character.entity';
import { Repository } from 'typeorm';
import { CreateCharacterDto } from './entity/create-character.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  async getCharacterById(characterId: string): Promise<Character> {
    if (isUUID(characterId)) {
      const found = await this.characterRepository.findOne({
        where: { id: characterId },
      });

      if (!found) {
        throw new NotFoundException(`Character ${characterId} not found`);
      }

      return found;
    } else {
      throw new BadRequestException(`UUID ${characterId} not correct format`);
    }
  }

  async createCharacter(
    createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    const { name, role, lane, description, imgUrl } = createCharacterDto;
    const character = this.characterRepository.create({
      name,
      role,
      lane,
      description,
      imgUrl,
    });
    await this.characterRepository.save(character);

    return character;
  }

  async deleteCharacterById(characterId: string): Promise<void> {
    if (isUUID(characterId)) {
      const result = await this.characterRepository.delete(characterId);

      if (result.affected === 0) {
        throw new NotFoundException(
          `Character with id ${characterId} not found`,
        );
      }
    } else {
      throw new BadRequestException(`UUID ${characterId} not correct format`);
    }
  }

  async updateCharacter(
    characterId: string,
    createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    if (isUUID(characterId)) {
      const character = await this.getCharacterById(characterId);
      const { name, role, lane, description, imgUrl } = createCharacterDto;

      character.lane = lane;
      character.name = name;
      character.role = role;
      character.description = description;
      character.imgUrl = imgUrl;
      await this.characterRepository.save(character);

      return character;
    } else {
      throw new BadRequestException(`UUID ${characterId} not correct format`);
    }
  }

  async getAllCharacters(): Promise<Character[]> {
    return await this.characterRepository.find();
  }
}
