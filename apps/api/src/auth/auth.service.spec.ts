import * as bcrypt from 'bcrypt';
import {AuthService} from './auth.service'
import {Test, TestingModule} from '@nestjs/testing'
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {RegisterDto} from './dto/register.dto'
import { Role } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt')
const mockHash= bcrypt.hash as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;

describe('AuthService',()=>{
    let service: AuthService;

    const mockUsersService={
        findByEmail: jest.fn(),
        create: jest.fn(),
    }

    const mockJWTService={
        sign: jest.fn().mockReturnValue('signed.jwt.token'),
    }

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers:[
                AuthService,
                {provide:UsersService, useValue:mockUsersService},
                {provide:JwtService, useValue:mockJWTService}
            ]
        }).compile();
        service = module.get<AuthService>(AuthService);
    })

    afterEach(()=>jest.clearAllMocks());

    describe('register()',()=>{
        const dto:RegisterDto = {
            name:"Vraj Patel",
            email:"vrajpatel@gmail.com",
            password:"testing123",
            role:Role.OWNER,
            organizationId: 1,
        }

        it('should hash password and return access_token',async ()=>{
            mockUsersService.findByEmail.mockResolvedValue(null);
            mockHash.mockResolvedValue('hashed_pw');
            mockUsersService.create.mockResolvedValue({
                id: 1, ...dto, password: 'hashed_pw',
            });
            const result = await service.register(dto)
            expect(mockHash).toHaveBeenCalledWith('testing123', 12);
            expect(mockUsersService.create).toHaveBeenCalledWith(
                expect.objectContaining({ password: 'hashed_pw' })
            );
            expect(result.access_token).toBe('signed.jwt.token');
        })

        it('should NOT return password in response', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);
            mockHash.mockResolvedValue('hashed_pw');
            mockUsersService.create.mockResolvedValue({
                id: 1, ...dto, password: 'hashed_pw',
            });

            const result = await service.register(dto);

            expect((result as any).user?.password).toBeUndefined();
        });

        it('should throw ConflictException if email already exists', async () => {
            mockUsersService.create.mockRejectedValue(
                new ConflictException('Email already registered'),
            );
            await expect(service.register(dto)).rejects.toThrow(ConflictException);

            expect(mockUsersService.create).toHaveBeenCalled();
        });
    })

    describe('login()',()=>{
        const dto={
            email:'vrajpatel@gmail.com',
            password:"testing@123",
        }

        const existingUser={
            id:             1,
            email:          'vrajpatel@gmail.com',
            password:       'hashed_pw',
            role:           Role.OWNER,
            organizationId: 1,
        }

        it('should return access_token for valid credentials', async () => {
            mockUsersService.findByEmail.mockResolvedValue(existingUser);
            mockCompare.mockResolvedValue(true);

            const result = await service.login(dto);

            expect(result.access_token).toBe('signed.jwt.token');
        });

         it('should throw UnauthorizedException for unknown email', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(service.login(dto))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for wrong password', async () => {
            mockUsersService.findByEmail.mockResolvedValue(existingUser);
            mockCompare.mockResolvedValue(false); // wrong password

            await expect(service.login(dto))
                .rejects.toThrow(UnauthorizedException);
        });

         it('should return same error message for wrong email and wrong password', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);
            const err1 = await service.login(dto).catch(e => e);
            mockUsersService.findByEmail.mockResolvedValue(existingUser);
            mockCompare.mockResolvedValue(false);
            const err2 = await service.login(dto).catch(e => e);
            expect(err1.message).toBe(err2.message);
        });

        it('should sign JWT with correct payload', async () => {
            mockUsersService.findByEmail.mockResolvedValue(existingUser);
            mockCompare.mockResolvedValue(true);

            await service.login(dto);

            expect(mockJWTService.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                sub:            existingUser.id,
                email:          existingUser.email,
                role:           existingUser.role,
                organizationId: existingUser.organizationId,
                })
            );
        });


    })
})

