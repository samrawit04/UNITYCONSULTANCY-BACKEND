import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Counselor } from '../entities/counselor.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CompleteCounselorProfileDto } from '../dto/complete-counselor-profile.dto';
import { RatingService } from './rating.service';

@Injectable()
export class CounselorService {
  constructor(
    @InjectRepository(Counselor)
    private readonly counselorRepository: Repository<Counselor>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly ratingService: RatingService,
  ) {}

  async completeProfile(dto: CompleteCounselorProfileDto): Promise<Counselor> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'COUNSELOR') {
      throw new ForbiddenException(
        'Only counselors can complete a counselor profile',
      );
    }

    let counselor = await this.counselorRepository.findOne({
      where: { userId: dto.userId },
      relations: ['user'],
    });

    if (!counselor) {
      counselor = this.counselorRepository.create({
        ...dto,
        user: user,
      });
    } else {
      this.counselorRepository.merge(counselor, dto);
    }

    return await this.counselorRepository.save(counselor);
  }

  async getCounselorProfile(userId: string): Promise<any> {
    const counselor = await this.counselorRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!counselor) {
      throw new NotFoundException('Counselor not found');
    }

    const avgScore = await this.ratingService.getAverageScore(userId);
    const roundedAvg = Math.round(avgScore * 10) / 10;

    return {
      ...counselor,
      averageScore: roundedAvg,
    };
  }

  async approveCounselor(userId: string): Promise<Counselor> {
    const counselor = await this.counselorRepository.findOne({
      where: { userId },
    });

    if (!counselor) {
      throw new NotFoundException('Counselor not found');
    }

    counselor.isApproved = true;
    counselor.approvedAt = new Date();

    return this.counselorRepository.save(counselor);
  }

  async findAll(): Promise<Counselor[]> {
    return this.counselorRepository.find({
      relations: ['user', 'ratings', 'articles'],
    });
  }
}
