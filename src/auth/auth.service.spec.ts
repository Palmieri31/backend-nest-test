import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RolesService } from 'src/roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/createUserDto';
import { User } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RoleValue } from 'src/roles/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let rolesService: RolesService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockRolesService = {
    findByName: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.spyOn(bcrypt, 'hash').mockImplementation(async (password: string) => {
      return '$2b$10$hashedPassword1234567890';
    });

    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(async (password: string, hash: string) => {
        return (
          password === 'password' && hash === '$2b$10$hashedPassword1234567890'
        );
      });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    rolesService = module.get<RolesService>(RolesService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return access token on successful sign in', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: 1,
        email,
        password: hashedPassword,
        username: 'testUser',
        roles: [],
      };

      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(async (password: string, hash: string) => {
          return true;
        });
      mockJwtService.signAsync.mockResolvedValue('token123');

      const result = await service.signIn(email, password);
      expect(result).toEqual({ access_token: 'token123' });
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });

    it('should throw UnauthorizedException if user not found or password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      mockUsersService.findOneByEmail.mockResolvedValue(null);
      await expect(service.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );

      const user = {
        id: 1,
        email,
        password: 'hashedPassword',
        username: 'testUser',
        roles: [],
      };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(async (password: string, hash: string) => {
          return false;
        });
      await expect(service.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create a user and return access token and user info', async () => {
      const createUserDto: CreateUserDto = {
        username: 'username example',
        email: 'newuser@example.com',
        password: 'password',
      };
      const userRole = { id: 1, name: RoleValue.User };
      const newUser = {
        id: 2,
        email: createUserDto.email,
        username: 'newUser',
        roles: [userRole],
      };

      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockRolesService.findByName.mockResolvedValue(userRole);
      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.signAsync.mockResolvedValue('token123');

      const result = await service.register(createUserDto);
      expect(result).toEqual({ access_token: 'token123', user: newUser });
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockRolesService.findByName).toHaveBeenCalledWith(RoleValue.User);

      expect(mockUsersService.create).toHaveBeenCalledWith(
        { ...createUserDto, password: '$2b$10$hashedPassword1234567890' },
        [userRole],
      );
    });

    it('should throw BadRequestException if email is already in use', async () => {
      const createUserDto: CreateUserDto = {
        username: 'username example',
        email: 'existing@example.com',
        password: 'password',
      };

      mockUsersService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: createUserDto.email,
      });
      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
