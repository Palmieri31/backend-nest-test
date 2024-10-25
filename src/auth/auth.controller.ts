import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from 'src/users/dto/signInDto';
import { CreateUserDto } from 'src/users/dto/createUserDto';
import { User } from 'src/users/user.entity';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOkResponse({ description: 'OK' })
  @ApiUnauthorizedResponse({ description: 'Incorrect password' })
  @UseInterceptors(ClassSerializerInterceptor)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiCreatedResponse({ description: 'successfully registered' })
  @ApiBadRequestResponse({ description: 'the email is already in use' })
  @UseInterceptors(ClassSerializerInterceptor)
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ access_token: string; user: User }> {
    const userCreated = await this.authService.register(createUserDto);
    return userCreated;
  }
}
