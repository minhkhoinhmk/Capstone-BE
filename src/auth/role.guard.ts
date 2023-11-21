import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NameRole } from 'src/role/enum/name-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<NameRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    let userRole: NameRole;

    if (user.role !== NameRole.Learner) {
      userRole = user.role.name;
      console.log(userRole);
    } else {
      userRole = NameRole.Learner;
      console.log(userRole);
    }

    return requiredRoles.includes(userRole);
  }
}
