import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Role } from '../enum/role.enum';

export class CreateUserDto {
  @IsNotEmpty() firstName: string;
  @IsNotEmpty() lastName: string;
  @IsEmail() email: string;
  @IsString() password?: string;
  @IsEnum(Role, {
    message: 'Role must be either CLIENT or COUNSELOR',
  })
  role: Role;
}

export class VerifyAccountDto {
  @IsString()
  public verificationId: string;

  @IsString()
  public otp: string;

  @IsBoolean()
  public isOtp: boolean;
}
