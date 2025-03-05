import { PartialType } from '@nestjs/swagger';
import { CreateFilmDto } from './createFilmDto';

export class UpdateFilmDto extends PartialType(CreateFilmDto) {}
