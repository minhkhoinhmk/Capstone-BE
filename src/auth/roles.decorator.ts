import { SetMetadata } from '@nestjs/common';
import { NameRole } from 'src/role/enum/name-role.enum';

export const HasRoles = (...roles: NameRole[]) => SetMetadata('roles', roles);
