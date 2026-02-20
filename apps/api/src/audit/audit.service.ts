import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuthenticatedUser, AuditAction } from "@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data";


@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    user:        AuthenticatedUser,
    action:      AuditAction,
    resourceId?: number,
    detail?:     string,
  ): Promise<void> {
    const entry = this.auditRepo.create({
      userId:    user.id,
      userEmail: user.email,  
      userRole:  user.role,   
      action,
      resourceId,
      detail,
    });
    await this.auditRepo.save(entry);
    const rid = resourceId ? `resource=#${resourceId}` : 'resource=N/A';
    const det = detail ? ` | ${detail}` : '';
    console.log(
      `[AUDIT] ${new Date().toISOString()} | ` +
      `${user.email} (${user.role}) | ` +
      `${action} | ${rid}${det}`
    );
  }

  findAll(): Promise<AuditLog[]> {
    return this.auditRepo.find({
      order: { timestamp: 'DESC' },  
    });
  }
}