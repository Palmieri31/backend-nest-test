import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from 'src/users/dto/signInDto';
import { CreateUserDto } from 'src/users/dto/createUserDto';
import { User } from 'src/users/user.entity';
import {
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return a token on successful sign in', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const expectedResponse = { access_token: 'token123' };

      mockAuthService.signIn.mockResolvedValue(expectedResponse);

      const result = await controller.signIn(signInDto);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
    });

    it('should throw UnauthorizedException on incorrect password', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.signIn.mockRejectedValue(
        new UnauthorizedException('Incorrect password'),
      );

      await expect(controller.signIn(signInDto)).rejects.toThrow(
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
      const expectedUser = new User();
      expectedUser.email = createUserDto.email;
      const expectedResponse = { access_token: 'token123', user: expectedUser };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(createUserDto);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw BadRequestException if email is already in use', async () => {
      const createUserDto: CreateUserDto = {
        username: 'username example',
        email: 'existing@example.com',
        password: 'password',
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('the email is already in use'),
      );

      await expect(controller.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
