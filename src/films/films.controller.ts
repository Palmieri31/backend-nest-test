import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { Film } from './film.entity';
import { CreateFilmDto } from './dto/createFilmDto';
import { UpdateFilmDto } from './dto/updateFilmDto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { RoleValue } from 'src/roles/role.enum';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('films')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'forbidden' })
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiCreatedResponse({ description: 'film successfully created.' })
  @ApiConflictResponse({ description: 'Film with episode_id already exists.' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleValue.Admin)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() film: CreateFilmDto): Promise<Film> {
    return this.filmsService.create(film);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<Film[]> {
    return this.filmsService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Film with id not found.' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleValue.User)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id') id: number): Promise<Film> {
    return this.filmsService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @ApiOkResponse({ description: 'OK' })
  @ApiConflictResponse({ description: 'Film with episode_id already exists.' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleValue.Admin)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id') id: number,
    @Body() film: UpdateFilmDto,
  ): Promise<Film> {
    return this.filmsService.update(id, film);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOkResponse({ description: 'OK' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleValue.Admin)
  @UseInterceptors(ClassSerializerInterceptor)
  async remove(@Param('id') id: number): Promise<void> {
    return this.filmsService.remove(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('import')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleValue.Admin)
  @UseInterceptors(ClassSerializerInterceptor)
  async importFilms(): Promise<Film[]> {
    return this.filmsService.fetchAndSaveFilms();
  }
}
