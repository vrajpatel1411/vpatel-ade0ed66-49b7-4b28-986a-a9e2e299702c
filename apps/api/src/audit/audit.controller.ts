import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse
} from '@nestjs/swagger';
import { RolesGuard, Roles, CurrentUser } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/auth';
import { Role, AuthenticatedUser, AuditAction } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

@ApiTags('Audit Log')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('audit-log')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary:     'View audit logs',
    description: 'Returns all access and mutation events, newest first. Owner and Admin only.',
  })
  @ApiOkResponse({ type: [AuditLog] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Viewer role is not permitted' })
  async findAll(@CurrentUser() user: AuthenticatedUser): Promise<AuditLog[]> {
    await this.auditService.log(user, AuditAction.VIEW_AUDIT_LOG);
    return this.auditService.findAll();
  }
}