import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RoleValue } from './role.enum';

describe('RolesService', () => {
  let service: RolesService;
  let rolesRepository: Repository<Role>;

  const mockRolesRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRolesRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByName', () => {
    it('should return a role by name', async () => {
      const roleName: RoleValue = RoleValue.User;
      const expectedRole = { id: 1, name: roleName };

      mockRolesRepository.findOne.mockResolvedValue(expectedRole);

      const role = await service.findByName(roleName);
      expect(role).toEqual(expectedRole);
      expect(mockRolesRepository.findOne).toHaveBeenCalledWith({
        where: { name: roleName },
      });
    });

    it('should throw NotFoundException if role not found', async () => {
      const roleName: RoleValue = RoleValue.User;

      mockRolesRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findByName(roleName)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByName(roleName)).rejects.toThrow(
        `Role with name ${roleName} not found`,
      );
    });
  });
});
