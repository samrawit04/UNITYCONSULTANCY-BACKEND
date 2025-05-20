import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { AccountStatusEnum } from 'src/shared/enums';
import { Role } from 'src/auth/enum/role.enum';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const adminEmail = 'admin@example.com';

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });
    if (!existingAdmin) {
      const password = await bcrypt.hash('admin123', 10);
      const admin = this.userRepository.create({
        email: adminEmail,
        password,
        role: Role.ADMIN,
        status: AccountStatusEnum.ACTIVE,
        firstName: 'john',
        lastName: 'smith',
      });

      await this.userRepository.save(admin);
      console.log('✅ Admin account created.');
    } else {
      console.log('ℹ️ Admin already exists.');
    }
  }
}
