import { SetMetadata } from '@nestjs/common';
import { Role } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);