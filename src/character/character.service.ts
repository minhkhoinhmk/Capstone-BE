import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from './entity/character.entity';
import { Repository } from 'typeorm';
import { CreateCharacterDto } from './dto/create-character.dto';
import { isUUID } from 'class-validator';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class CharacterService {
  private logger = new Logger('CharacterService', { timestamp: true });

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
        this.logger.error(
          `method=getCharacterById, could not find id= ${characterId}`,
        );
        throw new NotFoundException(`Character ${characterId} not found`);
      }

      this.logger.log(
        `method=getCharacterById, response: ${JSON.stringify(found)}`,
      );

      return found;
    } else {
      this.logger.error(
        `method=getCharacterById, uuid= ${characterId} not correct`,
      );
      throw new BadRequestException(`UUID ${characterId} not correct format`);
    }
  }

  async createCharacter(
    createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    const { name, role, lane, description, imgUrl, isActive } =
      createCharacterDto;
    const character = this.characterRepository.create({
      name,
      role,
      lane,
      description,
      imgUrl,
      isActive,
    });
    await this.characterRepository.save(character);

    this.logger.log(
      `method=createCharacter, response: ${JSON.stringify(character)}`,
    );

    return character;
  }

  async deleteCharacterById(characterId: string): Promise<void> {
    if (isUUID(characterId)) {
      const result = await this.characterRepository.delete(characterId);

      this.logger.error(`method=deleteCharacterById, deleted successfully`);

      if (result.affected === 0) {
        this.logger.error(
          `method=deleteCharacterById, could not find id= ${characterId}`,
        );
        throw new NotFoundException(
          `Character with id ${characterId} not found`,
        );
      }
    } else {
      this.logger.error(
        `method=deleteCharacterById, uuid= ${characterId} not correct`,
      );
      throw new BadRequestException(`UUID ${characterId} not correct format`);
    }
  }

  async updateCharacter(
    characterId: string,
    createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    if (isUUID(characterId)) {
      const character = await this.getCharacterById(characterId);
      const { name, role, lane, description, imgUrl, isActive } =
        createCharacterDto;

      character.lane = lane;
      character.name = name;
      character.role = role;
      character.description = description;
      character.imgUrl = imgUrl;
      character.isActive = isActive;
      await this.characterRepository.save(character);

      this.logger.log(
        `method=updateCharacter, response: ${JSON.stringify(character)}`,
      );

      return character;
    } else {
      this.logger.error(
        `method=updateCharacter, uuid= ${characterId} not correct`,
      );
      throw new BadRequestException(`UUID ${characterId} not correct format`);
    }
  }

  async getAllCharacters(
    options: IPaginationOptions,
    isActive: boolean,
  ): Promise<Pagination<Character>> {
    const queryBuilder = this.characterRepository.createQueryBuilder('c');

    if (isActive) {
      queryBuilder.where('c.isActive = :isActive', {
        isActive: isActive,
      });
    }

    queryBuilder.getMany();
    const characters = await paginate<Character>(queryBuilder, options);

    this.logger.log(
      `method=getAllCharacters, size: ${characters.meta.totalItems}, isActive: ${isActive}`,
    );

    this.logger.log(
      `method=getAllCharacters, Hello from Khoi`,
    );

    return characters;
  }
}
