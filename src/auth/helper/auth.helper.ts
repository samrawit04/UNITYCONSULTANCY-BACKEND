import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthHelper {
  constructor(private readonly jwt: JwtService) {}
  // Validate User's password

  public compareHashedValue(
    originalValue: string,
    hashedValue: string,
  ): boolean {
    return bcrypt.compareSync(originalValue, hashedValue);
  }

  // Generate JWT Token
  public generateAccessToken(payload: any): string {
    return this.jwt.sign(
      { ...payload },
      {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES,
      },
    );
  }

  // Generate JWT Refresh Token
  public generateRefreshToken(payload: any): string {
    return this.jwt.sign(
      { ...payload },
      {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
      },
    );
  }

  // Encode User's password
  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(12);
    return bcrypt.hashSync(password, salt);
  }
}
