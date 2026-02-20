import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn, CreateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('teams')
export class Team {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Engineering' })
  @Column()
  name!: string;

  @ApiProperty({ example: 1 })
  @Column()
  organizationId!: number;

  @ManyToOne(() => Organization, org => org.teams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @OneToMany(() => User, user => user.team)
  users!: User[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;
}