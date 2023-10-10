import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/role/entity/role.entity';
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
    const userRoles: NameRole[] = [];
    let isAuthorized = false;

    if (user.roles) {
      for (const role of user.roles as Role[]) {
        userRoles.push(role.name);
      }
      console.log(userRoles);
    } else {
      userRoles.push(user.role.name);
      console.log(userRoles);
    }

    userRoles.forEach((userRole) => {
      if (requiredRoles.some((role) => userRole.includes(role))) {
        isAuthorized = true;
      }
    });

    return isAuthorized;
  }
}
