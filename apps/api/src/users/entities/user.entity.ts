import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organization } from '../../organizations/entities/organization.entity';
import { Team } from '../../organizations/entities/team.entity';
import { Role } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Vraj Patel' })
  @Column()
  name!: string;

  @ApiProperty({ example: 'vrajpatel@gmail.com' })
  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @ApiProperty({ enum: Role, example: Role.OWNER })
  @Column({ type: 'simple-enum',enum:Role, default: Role.VIEWER })
  role!: Role;

  @ApiProperty({ example: 1 })
  @Column()
  organizationId!: number;

  @ManyToOne(() => Organization, org => org.users)
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @ApiPropertyOptional({ example: 1 })
  @Column({ nullable: true })
  teamId!: number;

  @ManyToOne(() => Team, team => team.users, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team!: Team;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;
}