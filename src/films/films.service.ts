import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from './film.entity';
import axios from 'axios';
import { CreateFilmDto } from './dto/createFilmDto';
import { UpdateFilmDto } from './dto/updateFilmDto';

@Injectable()
export class FilmsService {
  constructor(
    @InjectRepository(Film)
    private filmsRepository: Repository<Film>,
  ) {}

  async filmExistsByEpisodeId(episode_id: number): Promise<boolean> {
    if (episode_id === undefined) {
      return false;
    }
    const film = await this.filmsRepository.findOne({ where: { episode_id } });
    return film !== null;
  }

  async create(film: CreateFilmDto): Promise<Film> {
    const existingFilm = await this.filmExistsByEpisodeId(film.episode_id);
    if (existingFilm) {
      throw new ConflictException(
        `Film with episode_id ${film.episode_id} already exists.`,
      );
    }

    const filmCreated = this.filmsRepository.create(film);
    return this.filmsRepository.save(filmCreated);
  }

  async findAll(): Promise<Film[]> {
    return this.filmsRepository.find();
  }

  async findOne(id: number): Promise<Film> {
    const filmFound = await this.filmsRepository.findOne({ where: { id } });
    if (!filmFound) {
      throw new NotFoundException(`Film with id ${id} not found.`);
    }
    return filmFound;
  }

  async update(id: number, film: UpdateFilmDto): Promise<Film> {
    await this.findOne(id);
    const existingFilm = await this.filmExistsByEpisodeId(film.episode_id);
    if (existingFilm) {
      throw new ConflictException(
        `Film with episode_id ${film.episode_id} already exists.`,
      );
    }

    await this.filmsRepository.update(id, film);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.filmsRepository.delete(id);
  }

  async fetchAndSaveFilms(): Promise<Film[]> {
    const apiUrl = process.env.API_URL;

    try {
      const response = await axios.get(apiUrl);
      const filmsData = response.data.results;

      const savedFilms: Film[] = [];

      for (const filmData of filmsData) {
        const existingFilm = await this.filmExistsByEpisodeId(
          filmData.episode_id,
        );
        if (!existingFilm) {
          const film = new Film();
          film.title = filmData.title;
          film.episode_id = filmData.episode_id;
          film.opening_crawl = filmData.opening_crawl;
          film.director = filmData.director;
          film.producer = filmData.producer;
          film.release_date = new Date(filmData.release_date);
          film.created = filmData.created;
          film.edited = filmData.edited;

          savedFilms.push(await this.filmsRepository.save(film));
        }
      }

      return savedFilms;
    } catch (error) {
      throw new Error('Could not fetch films');
    }
  }
}
