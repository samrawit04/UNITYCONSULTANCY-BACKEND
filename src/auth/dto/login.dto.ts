import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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
  @IsEmail() email?: string;
  @IsNotEmpty() password: string;
}
