import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Repository } from 'typeorm';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { AccountStatusEnum } from 'src/shared/enums';
import { Role } from 'src/auth/enum/role.enum';
import { NotificationService } from '../../Notification/service/notification.service';


@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Counselor)
    private readonly counselorRepo: Repository<Counselor>,
   
 private readonly notificationService: NotificationService,

  ) {}

  // View all users
async getAllClients() {
  return this.userRepo.find({
    where: { role: Role.CLIENT  },
    relations: ['client'], // get the client profile too if needed
  });
}

async getAllCounselorsWithStatus() {
  const counselors = await this.counselorRepo.find({
    relations: ['user'],
  });

  return counselors.map((counselor) => ({
    id: counselor.userId,
    firstName: counselor.user?.firstName || '',
    lastName: counselor.user?.lastName || '',
    email: counselor.user?.email || '',
    status: counselor.user?.status || '',
    isApproved: counselor.isApproved,
    profilePicture: counselor.profilePicture,
    specialization: counselor.specialization,
  }));
}


  // Activate/Deactivate a counselor
 async setCounselorStatus(userId: string, status: 'ACTIVE' | 'INACTIVE') {
  const user = await this.userRepo.findOne({ where: { id: userId } });

  if (!user || user.role !== 'COUNSELOR') {
    throw new NotFoundException('Counselor not found');
  }

  user.status = status;
  await this.userRepo.save(user);

  // Notify counselor of status change
  await this.notificationService.sendNotification({
    recipientId: user.id,
    role: 'COUNSELOR',
    type: 'SYSTEM',
    message:
      status === 'ACTIVE'
        ? 'Your account has been activated.'
        : 'Your account has been deactivated by the admin. If you think it is by mistake contact the admin at admin@gmail.com',
  });

  return user;
}


  // Approve a counselor
  async approveCounselor(userId: string) {
  const counselor = await this.counselorRepo.findOne({ where: { userId }, relations: ['user'] });
  if (!counselor || !counselor.user) {
    throw new NotFoundException('Counselor not found');
  }

  counselor.isApproved = true;
  counselor.approvedAt = new Date();
  await this.counselorRepo.save(counselor);

  // Send notification to counselor
  await this.notificationService.sendNotification({
    recipientId: counselor.user.id,
    role: 'COUNSELOR',
    type: 'SYSTEM',
    message: 'Congratulations! Your account has been approved by the admin.',
  });

  return counselor;
}

}
