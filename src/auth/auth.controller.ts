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
import { signInDto } from 'src/users/dto/signInDto';
import { createUserDto } from 'src/users/dto/createUserDto';
import { User } from 'src/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseInterceptors(ClassSerializerInterceptor)
  async signIn(@Body() signInDto: signInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  async register(
    @Body() createUserDto: createUserDto,
  ): Promise<{ access_token: string; user: User }> {
    const userCreated = await this.authService.register(createUserDto);
    return userCreated;
  }
}
