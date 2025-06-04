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
import { ReviewService } from './review.service';

@Injectable()
export class CounselorService {
  constructor(
    @InjectRepository(Counselor)
    private readonly counselorRepository: Repository<Counselor>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly reviewService: ReviewService,
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

  async getCounselorById(userId: string): Promise<any> {
  const counselor = await this.counselorRepository.findOne({
    where: { userId },
    relations: ['user'],
  });

  if (!counselor) {
    throw new NotFoundException('Counselor not found');
  }

  // Return full profile info
  return {
    userId: counselor.userId,
    firstName: counselor.user.firstName,
    lastName: counselor.user.lastName,
    email: counselor.user.email,
    status: counselor.user.status,
    isApproved: counselor.isApproved,
    profilePicture: counselor.profilePicture,
    specialization: counselor.specialization,
    phoneNumber: counselor.phoneNumber,
    addres: counselor.addres,
    gender: counselor.gender,
    bio: counselor.bio,
    preferredPaymentMethod: counselor.preferredPaymentMethod,
    bankAccountOrPhone: counselor.bankAccountOrPhone,
    languagesSpoken: counselor.languagesSpoken,
    cerificate: counselor.cerificate,
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

  async getAllCounselorsWithStatus(): Promise<any[]> {
  const counselors = await this.counselorRepository.find({
    relations: ['user'],
  });

  return counselors.map((counselor) => ({
    id: counselor.userId,
    firstName: counselor.user.firstName,
    lastName: counselor.user.lastName,
    email: counselor.user.email,
    status: counselor.user.status,
    profilePicture: counselor.profilePicture,
    specialization: counselor.specialization,
    isApproved: counselor.isApproved,
  }));
}

async findApprovedAndActive() {
  const counselors = await this.counselorRepository.find({
    relations: ['user'],
  });

  return counselors
    .filter(c => c.user?.status === 'ACTIVE' && c.isApproved)
    .map(c => ({
      id: c.user.id,
      firstName: c.user.firstName,
      lastName: c.user.lastName,
      profilePicture: c.profilePicture,
      specialization: c.specialization,
    }));
}




  async findAll(): Promise<any[]> {
    const counselors = await this.counselorRepository.find({
      relations: ['user'],
    });

    return counselors.map((counselor) => ({
      id: counselor.userId,
      firstName: counselor.user.firstName,
      lastName: counselor.user.lastName,
      image: counselor.profilePicture,
    }));
  }
}
