import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';

export class LoginResponseDto {
  public access_token: string;
  public refresh_token?: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;

  @IsString()
  confirmPassword: string;
}

export class ResendOtpDto {
  @IsString()
  public verificationId: string;
}


export class LoginDto {
  @IsNotEmpty({ message: 'Email is required' })
  @ValidateIf((o) => o.email !== '') // only validate format if not empty
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}