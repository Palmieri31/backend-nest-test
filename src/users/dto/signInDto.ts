import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDefined, IsEmail } from 'class-validator';

export class SignInDto {
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
