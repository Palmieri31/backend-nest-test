import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { createUserDto } from './dto/createUserDto';
import { Role } from 'src/roles/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async create(createUserDto: createUserDto, roles: [Role]): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    user.roles = roles;
    return await this.userRepository.save(user);
  }
}
