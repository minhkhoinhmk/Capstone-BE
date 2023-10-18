import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entity/role.entity';
import { Repository } from 'typeorm';
import { NameRole } from './enum/name-role.enum';

@Injectable()
export class RoleRepository {
  private logger = new Logger('RoleRepository', { timestamp: true });

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getRoleByName(name: NameRole): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: name },
    });
    return role;
  }
}
