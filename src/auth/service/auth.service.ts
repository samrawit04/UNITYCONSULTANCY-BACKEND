import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GoogleAuthDto } from '../dto/google-auth.dto';
import { User } from '../entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async googleLogin(googleAuthDto: GoogleAuthDto): Promise<User> {
    const { googleId, name, email, role } = googleAuthDto;

    const [firstName, ...lastNameParts] = name?.split(' ') ?? [''];
    const lastName = lastNameParts.join(' ');

    // Check if the user already exists by email
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Create a new user if not found
      user = new User();
      user.googleId = googleId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.status = 'ACTIVE';
      user.role = role; // role from frontend ('client' | 'counselor')

      await this.userRepository.save(user);
    } else if (!user.googleId) {
      // Optionally update existing user with Google ID if not already linked
      user.googleId = googleId;
      await this.userRepository.save(user);
    }

    return user;
  }
}
