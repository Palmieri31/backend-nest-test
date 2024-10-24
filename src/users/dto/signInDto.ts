import { IsString, IsNotEmpty, IsDefined, IsEmail } from 'class-validator';

export class signInDto {
  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  password: string;
}
