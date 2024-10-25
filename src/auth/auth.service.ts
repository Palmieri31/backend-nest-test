import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/createUserDto';
import { User } from 'src/users/user.entity';
import { RoleValue } from 'src/roles/role.enum';
import { RolesService } from 'src/roles/roles.services';

@Injectable()
export class AuthService {
  saltOrRounds: number = 10;

  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('incorrect password');
    }

    return {
      access_token: await this.jwtService.signAsync({
        id: user.id,
        username: user.username,
        roles: user.roles.map((role) => role.name),
      }),
    };
  }

  async register(
    payload: CreateUserDto,
  ): Promise<{ access_token: string; user: User }> {
    const result = await this.usersService.findOneByEmail(payload.email);

    if (result) {
      throw new BadRequestException('the email is already in use');
    }

    const hashPass = await bcrypt.hash(payload.password, this.saltOrRounds);

    let userData = {
      ...payload,
      password: hashPass,
    };

    const userRole = await this.rolesService.findByName(RoleValue.User);
    const newUser = await this.usersService.create(userData, [userRole]);

    return {
      user: newUser,
      access_token: await this.jwtService.signAsync({
        id: newUser.id,
        username: newUser.username,
        roles: newUser.roles,
      }),
    };
  }
}
