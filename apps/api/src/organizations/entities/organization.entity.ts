import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';

@Entity('organizations')
export class Organization {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Company' })
  @Column({ unique: true })
  name!: string;

  @ApiProperty({ type: () => [Team] })
  @OneToMany(() => Team, team => team.organization, { cascade: true })
  teams!: Team[];

  @OneToMany(() => User, user => user.organization)
  users!: User[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;
}