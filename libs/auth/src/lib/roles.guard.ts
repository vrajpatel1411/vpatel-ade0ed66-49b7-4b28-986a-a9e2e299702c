import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { Role } from "@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data";
import { ROLES_KEY } from "./roles.decorator";

export const ROLE_HIERARCHY : Record<Role, Role[]> = {
    [Role.OWNER]: [Role.OWNER ,Role.ADMIN, Role.VIEWER],
    [Role.ADMIN]: [Role.ADMIN, Role.VIEWER],
    [Role.VIEWER]: [Role.VIEWER],
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const effective = ROLE_HIERARCHY[user.role as Role] ?? [];
    return required.some(r => effective.includes(r));
  }
}