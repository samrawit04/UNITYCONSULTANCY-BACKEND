// review.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { Repository } from 'typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { CreateReviewDto } from '../dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(Counselor)
    private readonly counselorRepo: Repository<Counselor>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const client = await this.clientRepo.findOne({ where: { userId: dto.clientId } });
    if (!client) throw new NotFoundException('Client not found');

    const counselor = await this.counselorRepo.findOne({ where: { userId: dto.counselorId } });
    if (!counselor) throw new NotFoundException('Counselor not found');

    const review = this.reviewRepo.create({
      comment: dto.comment,
      rating: dto.rating,
      client,
      counselor,
    });

    return this.reviewRepo.save(review);
  }

  async getReviewsForCounselor(counselorId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { counselor: { userId: counselorId } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }
}
