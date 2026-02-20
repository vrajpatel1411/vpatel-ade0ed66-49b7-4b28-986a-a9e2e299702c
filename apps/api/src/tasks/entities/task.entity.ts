import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TaskStatus } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

@Entity('tasks')
export class Task {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'task title' })
  @Column()
  title!: string;

  @ApiPropertyOptional({ example: 'additional information' })
  @Column({ nullable: true, type: 'text' })
  description!: string;

  @ApiProperty({ example: 1 })
  @Column()
  ownerId!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @ApiPropertyOptional({
    example: 2,
    description: 'User the task is assigned to'
  })
  @Column({ nullable: true })
  assignedToId!: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo!: User;

  @ApiProperty({
    enum:    TaskStatus,
    example: TaskStatus.TODO,
    default: TaskStatus.TODO,
  })
  @Column({
    type:    'text',
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;  
  
  @ApiProperty({ example: 1 })
  @Index()
  @Column()
  organizationId!: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}