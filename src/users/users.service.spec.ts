import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUserDto';
import { Role } from 'src/roles/role.entity';
import { RoleValue } from 'src/roles/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const expectedUser = { id: 1, email, roles: [] };

      mockUserRepository.findOne.mockResolvedValue(expectedUser);

      const user = await service.findOneByEmail(email);
      expect(user).toEqual(expectedUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        relations: ['roles'],
      });
    });

    it('should return undefined if no user found', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findOne.mockResolvedValue(undefined);

      const user = await service.findOneByEmail(email);
      expect(user).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'username example',
        email: 'newuser@example.com',
        password: 'password',
      };
      const roles: [Role] = [{ id: 1, name: RoleValue.User, users: [] }];
      const expectedUser = { id: 1, ...createUserDto, roles };

      mockUserRepository.create.mockReturnValue(expectedUser);
      mockUserRepository.save.mockResolvedValue(expectedUser);

      const user = await service.create(createUserDto, roles);
      expect(user).toEqual(expectedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expectedUser);
    });
  });
});
