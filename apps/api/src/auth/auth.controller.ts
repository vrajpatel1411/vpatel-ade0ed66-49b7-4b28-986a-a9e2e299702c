import {
  Controller, Post, Body, HttpCode, HttpStatus
} from '@nestjs/common';
import {
  ApiTags, ApiOperation,
  ApiCreatedResponse, ApiOkResponse,
  ApiConflictResponse, ApiUnauthorizedResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto} from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from '../dto/ResponseDTO';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary:     'Register a new user',
    description: 'Creates account and returns JWT. Use GET /organizations first to get valid organizationId and teamId.',
  })
  @ApiCreatedResponse({
    description: 'User registered. Returns user object + access_token.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({  description: 'Validation failed' })
  @ApiConflictResponse({    description: 'Email already registered' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:     'Login and get JWT token',
    description: 'Paste the returned access_token into the Authorize button (top right in Swagger UI).',
  })
  @ApiOkResponse({
    description: 'Login successful. Returns access_token.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}