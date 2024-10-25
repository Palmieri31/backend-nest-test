import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  password: string;
}
