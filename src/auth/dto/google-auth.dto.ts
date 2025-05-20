// src/auth/dto/google-auth.dto.ts
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../enum/role.enum';

export class GoogleAuthDto {
  @IsString()
  googleId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  accessToken?: string;
}
