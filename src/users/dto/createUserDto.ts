import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class createUserDto {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  password: string;
}
