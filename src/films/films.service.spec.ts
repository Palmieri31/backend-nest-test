import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { Film } from './film.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFilmDto } from './dto/createFilmDto';
import { UpdateFilmDto } from './dto/updateFilmDto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

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

const mockFilmRepository = {
  find: jest.fn().mockResolvedValue([mockFilm]),
  findOne: jest.fn().mockResolvedValue(mockFilm),
  create: jest.fn().mockReturnValue(mockFilm),
  save: jest.fn().mockResolvedValue(mockFilm),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};

describe('FilmsService', () => {
  let service: FilmsService;
  let repository: Repository<Film>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: getRepositoryToken(Film),
          useValue: mockFilmRepository,
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    repository = module.get<Repository<Film>>(getRepositoryToken(Film));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('filmExistsByEpisodeId', () => {
    it('should return true if a film with the given episode_id exists', async () => {
      const episodeId = 1;
      mockFilmRepository.findOne.mockResolvedValue(mockFilm);

      const result = await service['filmExistsByEpisodeId'](episodeId);
      expect(result).toBe(true);
      expect(mockFilmRepository.findOne).toHaveBeenCalledWith({
        where: { episode_id: episodeId },
      });
    });
  });

  describe('create', () => {
    it('should create a film', async () => {
      const createFilmDto: CreateFilmDto = {
        title: 'Test Film',
        episode_id: 1,
        opening_crawl: 'Opening crawl text',
        director: 'Director Name',
        producer: 'Producer Name',
        release_date: '2015-12-18',
      };
      jest.spyOn(service, 'filmExistsByEpisodeId').mockResolvedValueOnce(false);
      const result = await service.create(createFilmDto);
      expect(result).toEqual(mockFilm);
      expect(repository.save).toHaveBeenCalledWith(mockFilm);
    });

    it('should throw a conflict exception if episode_id already exists', async () => {
      jest.spyOn(service, 'filmExistsByEpisodeId').mockResolvedValueOnce(true);

      const createFilmDto: CreateFilmDto = {
        title: 'Test Film',
        episode_id: 1,
        opening_crawl: 'Opening crawl text',
        director: 'Director Name',
        producer: 'Producer Name',
        release_date: '2015-12-18',
      };
      await expect(service.create(createFilmDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of films', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockFilm]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a film by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockFilm);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a not found exception if film does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a film', async () => {
      const updateFilmDto: UpdateFilmDto = { title: 'Updated Film' };
      const result = await service.update(1, updateFilmDto);
      expect(result).toEqual(mockFilm);
      expect(repository.update).toHaveBeenCalledWith(1, updateFilmDto);
    });

    it('should throw a not found exception if film does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw a conflict exception if episode_id already exists', async () => {
      jest.spyOn(service, 'filmExistsByEpisodeId').mockResolvedValueOnce(true);
      await expect(service.update(999, {})).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a film', async () => {
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw a not found exception if film does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('fetchAndSaveFilms', () => {
    it('should fetch and save films from external API', async () => {
      const apiResponse = {
        data: {
          results: [mockFilm],
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(apiResponse);

      jest.spyOn(service, 'filmExistsByEpisodeId').mockResolvedValueOnce(false);

      const result = await service.fetchAndSaveFilms();
      expect(result).toEqual([mockFilm]);
    });

    it('should throw an error if fetching films fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));
      await expect(service.fetchAndSaveFilms()).rejects.toThrow(
        'Could not fetch films',
      );
    });
  });
});
