import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsInt,
  IsDateString,
} from 'class-validator';

export class CreateFilmDto {
  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsInt()
  @IsDefined()
  episode_id: number;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  opening_crawl: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  director: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  producer: string;

  @ApiProperty()
  @IsDateString()
  @IsDefined()
  release_date: string;
}
