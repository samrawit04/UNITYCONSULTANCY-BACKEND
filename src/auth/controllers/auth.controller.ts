import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { Role } from '../enum/role.enum';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Step 1: Receive role query, save in session, then redirect to OAuth
  @Get('google/start')
  async googleStart(
    @Req() req: Request,
    @Res() res: Response,
    @Query('role') role: string,
  ) {
    if (!role || !['CLIENT', 'COUNSELOR'].includes(role.toUpperCase())) {
      return res.status(400).json({ message: 'Role is required or invalid' });
    }

    req.session.role = role.toUpperCase();

    // Redirect to route with the actual OAuth guard
    return res.redirect('/auth/google/redirect');
  }

  // Step 2: Trigger Passport Google OAuth flow
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;

    // For example, user.role = 'client' or 'counselor'
    if (user.role === 'client') {
      return res.redirect('http://localhost:8080/client-dashboard');
    } else if (user.role === 'counselor') {
      return res.redirect('http://localhost:8080/counselor-dashboard');
    } else {
      return res.redirect('http://localhost:/login?error=Invalid%20role');
    }
  }

  // Step 3: Handle OAuth callback and complete login
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const role = req.session.role;
    if (!role || !['CLIENT', 'COUNSELOR'].includes(role)) {
      throw new BadRequestException('Role is required or invalid');
    }

    const googleProfile = req.user as any; // type accordingly

    const googleAuthDto: GoogleAuthDto = {
      googleId: googleProfile.googleId,
      name: googleProfile.name,
      email: googleProfile.email,
      picture: googleProfile.picture,
      role: role as Role,
    };

    const client = await this.authService.googleLogin(googleAuthDto);

    // Clear role from session
    delete req.session.role;

    if (role === 'CLIENT') {
      return res.redirect('http://localhost:8080/client-dashboard');
    } else if (role === 'COUNSELOR') {
      return res.redirect('http://localhost:8080/counselor-dashboard');
    } else {
      return res.redirect('http://localhost:8080/login?error=Invalid%20role');
    }
  }
}
