import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    findById(id:number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    findByEmail(email:string): Promise<User | null> {
        return this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();
    }

    async create(data: Partial<User>): Promise<User> {
        const existing= await this.userRepository.findOneBy({ email: data.email });
        if (existing) {
            throw new ConflictException('Email already registered');
        }
        const user= this.userRepository.create(data);
        return this.userRepository.save(user);
    }
}