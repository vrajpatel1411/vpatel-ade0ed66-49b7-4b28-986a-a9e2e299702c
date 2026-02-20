import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task name' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'User ID to assign this task to. Defaults to yourself.'
  })
  @IsNumber()
  @IsOptional()
  assignedToId?: number;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}