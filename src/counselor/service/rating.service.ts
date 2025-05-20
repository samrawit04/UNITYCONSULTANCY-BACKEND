import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Repository } from 'typeorm';
import { Counselor } from '../entities/counselor.entity';
import { CreateRatingDto } from '../dto/rating.dto';
import { Rating } from '../entities/rating.entity';
import { NotFoundException } from '@nestjs/common';

export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Counselor)
    private readonly counselorRepository: Repository<Counselor>,
  ) {}

  async create(dto: CreateRatingDto) {
    const client = await this.clientRepository.findOne({
      where: {
        userId: dto.clientId,
      },
    });

    if (!client) throw new NotFoundException('client doesnt exi');

    const counselor = await this.counselorRepository.findOne({
      where: { userId: dto.counselorId },
    });
    if (!counselor) throw new NotFoundException('Counselor not found');

    const rating = this.ratingRepository.create({ ...dto, client, counselor });
    return this.ratingRepository.save(rating);
  }

  async getAverageScore(counselorId: string): Promise<number> {
    const { avg } = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'avg')
      .where('rating.counselorId = :counselorId', { counselorId })
      .getRawOne();
    return parseFloat(avg) || 0;
  }
}
