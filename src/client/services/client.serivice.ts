import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { User } from 'src/auth/entity/user.entity';
import { CompleteClientProfileDto } from '../dto/complete-client-profile.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { userId },
      relations: ['user', 'ratings', 'bookings', 'payments'],
    });
  }

  async completeProfile(dto: CompleteClientProfileDto): Promise<Client> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'CLIENT') {
      throw new ForbiddenException(
        'Only clients can complete a client profile',
      );
    }

    let client = await this.clientRepository.findOne({
      where: { userId: dto.userId },
      relations: ['user'],
    });

    if (!client) {
      client = this.clientRepository.create({
        user,
        ...dto,
      });
    } else {
      this.clientRepository.merge(client, dto);
    }

    return await this.clientRepository.save(client);
  }

  // Get client by userId
  async getClientById(userId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { userId },
      relations: ['user', 'ratings', 'bookings', 'payments'],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  // Get all clients
  async getAllClients(): Promise<Client[]> {
    return this.clientRepository.find({
      relations: ['user'],
    });
  }
}
