import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtStore } from './entity/jwt-store.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStorerRepository {
  constructor(
    @InjectRepository(JwtStore)
    private jwtStoreRepository: Repository<JwtStore>,
  ) {}

  async removeJwtStoreByCode(code: string): Promise<void> {
    await this.jwtStoreRepository.delete({ code });
  }

  async getTokenAndCount(id: string): Promise<number> {
    const tokensAndCount = await this.jwtStoreRepository.findAndCount({
      where: { userId: id },
    });
    return tokensAndCount[1];
  }

  async create(accessToken: string, userId: string): Promise<JwtStore> {
    const jwtStore = this.jwtStoreRepository.create({
      code: accessToken,
      userId: userId,
    });
    return jwtStore;
  }

  async save(jwtStore: JwtStore): Promise<void> {
    this.jwtStoreRepository.save(jwtStore);
  }
}
