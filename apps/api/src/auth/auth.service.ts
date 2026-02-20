import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto} from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from '../dto/ResponseDTO';
import {JwtPayload} from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService:   JwtService,
  ) {}
  async register(dto: RegisterDto): Promise<AuthResponseDto & { user: any }> {
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      name:           dto.name,
      email:          dto.email,
      password:       hashedPassword,
      role:           dto.role,
      organizationId: dto.organizationId,
      teamId:         dto.teamId,
    });
    const { password, ...safeUser } = user as any;
    return {
      user:         safeUser,
      ...this.buildToken(user),
    };
  }
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildToken(user);
  }

  private buildToken(user: any): AuthResponseDto {
    const payload: JwtPayload = {
      sub:            user.id,
      email:          user.email,
      role:           user.role,
      organizationId: user.organizationId,
      teamId:         user.teamId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      expires_in:   '1d',
    };
  }
}