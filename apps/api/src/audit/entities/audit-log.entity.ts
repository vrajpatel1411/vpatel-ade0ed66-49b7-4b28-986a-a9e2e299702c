import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction, Role } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 1 })
  @Column()
  userId!: number;

  @ApiProperty({ example: 'vrajpatel@gmail.com' })
  @Column()
  userEmail!: string;

  @ApiProperty({ enum: Role, example: Role.OWNER })
  @Column({ type: 'simple-enum',enum:Role})
  userRole!: string;

  @ApiProperty({ enum: AuditAction, example: AuditAction.CREATE_TASK })
  @Index()
  @Column({ type: 'simple-enum',enum:AuditAction })
  action!: string;

  @ApiPropertyOptional({ example: 3 })
  @Column({ nullable: true })
  resourceId!: number;

  @ApiPropertyOptional({ example: 'title="Fix login bug"' })
  @Column({ nullable: true, type: 'text' })
  detail!: string;

  @ApiProperty()
  @Index()
  @CreateDateColumn()
  timestamp!: Date;
}