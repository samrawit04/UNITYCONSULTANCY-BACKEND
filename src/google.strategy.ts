import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from './auth/service/auth.service';
import { Role } from './auth/enum/role.enum';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
      state: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const { emails, id, photos, displayName } = profile;

    let role = req.session.role as string;
    if (!role || !Object.values(Role).includes(role as Role)) {
      role = Role.CLIENT;
    }

    return {
      googleId: id,
      email: emails?.[0]?.value ?? '',
      name: displayName,
      picture: photos?.[0]?.value ?? null,
      accessToken,
      role: role as Role,
    };

   
  }
}
