import {
  IsEmail,
  IsString,
} from 'class-validator';
import { ApiProperty} from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'vrajpatel@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'testing@123' })
  @IsString()
  password!: string;
}
