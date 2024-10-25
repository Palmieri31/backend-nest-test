import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/createFilmDto';
import { UpdateFilmDto } from './dto/updateFilmDto';
import { Film } from './film.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';

describe('FilmsController', () => {
  let filmsController: FilmsController;
  let filmsService: FilmsService;

  const mockCreateFilmDto: CreateFilmDto = {
    title: 'Test Film',
    episode_id: 1,
    opening_crawl: 'Opening crawl text.',
    director: 'Test Director',
    producer: 'Test Producer',
    release_date: '2015-12-18',
  };

  const mockFilm: Film = {
    id: 1,
    title: 'Test Film',
    episode_id: 1,
    opening_crawl: 'Opening crawl text.',
    director: 'Test Director',
    producer: 'Test Producer',
    release_date: new Date('2015-12-18'),
    created: '2015-12-18',
    edited: '2015-12-18',
  };

  const mockUpdateFilm: Film = {
    id: 1,
    title: 'Updated Test Film',
    episode_id: 1,
    opening_crawl: 'Opening crawl text.',
    director: 'Test Director',
    producer: 'Test Producer',
    release_date: new Date('2015-12-18'),
    created: '2015-12-18',
    edited: '2015-12-18',
  };

  const mockFilmService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    fetchAndSaveFilms: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    filmsController = module.get<FilmsController>(FilmsController);
    filmsService = module.get<FilmsService>(FilmsService);
  });

  it('should be defined', () => {
    expect(filmsController).toBeDefined();
  });

  describe('create', () => {
    it('should create a film', async () => {
      const createFilmDto: CreateFilmDto = mockCreateFilmDto;

      const result: Film = {
        id: 1,
        created: '2014-12-20 07:57:58',
        edited: '2014-12-20 07:57:58',
        ...createFilmDto,
        release_date: new Date(createFilmDto.release_date),
      };
      mockFilmService.create.mockResolvedValue(result);

      expect(await filmsController.create(createFilmDto)).toEqual(result);
      expect(mockFilmService.create).toHaveBeenCalledWith(createFilmDto);
    });

    it('should throw ConflictException if film already exists', async () => {
      const createFilmDto: CreateFilmDto = mockCreateFilmDto;

      mockFilmService.create.mockRejectedValue(new ConflictException());

      await expect(filmsController.create(createFilmDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of films', async () => {
      const result: Film[] = [mockFilm];
      mockFilmService.findAll.mockResolvedValue(result);

      expect(await filmsController.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a film', async () => {
      const result: Film = mockFilm;
      mockFilmService.findOne.mockResolvedValue(result);

      expect(await filmsController.findOne(1)).toEqual(result);
    });

    it('should throw NotFoundException if film does not exist', async () => {
      mockFilmService.findOne.mockRejectedValue(new NotFoundException());

      await expect(filmsController.findOne(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a film', async () => {
      const updateFilmDto: UpdateFilmDto = { title: 'Updated Test Film' };
      const result: Film = mockUpdateFilm;
      mockFilmService.update.mockResolvedValue(result);

      expect(await filmsController.update(1, updateFilmDto)).toEqual(result);
      expect(mockFilmService.update).toHaveBeenCalledWith(1, updateFilmDto);
    });
  });

  describe('remove', () => {
    it('should remove a film', async () => {
      mockFilmService.remove.mockResolvedValue(undefined);

      await filmsController.remove(1);
      expect(mockFilmService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('importFilms', () => {
    it('should import films', async () => {
      const result: Film[] = [];
      mockFilmService.fetchAndSaveFilms.mockResolvedValue(result);

      expect(await filmsController.importFilms()).toEqual(result);
    });
  });
});
