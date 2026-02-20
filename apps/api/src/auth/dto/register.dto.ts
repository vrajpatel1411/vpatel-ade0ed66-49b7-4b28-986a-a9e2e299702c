import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

export class RegisterDto {
  @ApiProperty({ example: 'Vraj Patel' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'alice@acme.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: Role, example: Role.OWNER })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({
    example: 1,
    description: 'Must be an existing organization ID',
  })
  @IsNumber()
  organizationId!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Optional — existing team ID',
  })
  @IsNumber()
  @IsOptional()
  teamId?: number;
}

export class LoginDto {
  @ApiProperty({ example: 'alice@acme.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;
}
