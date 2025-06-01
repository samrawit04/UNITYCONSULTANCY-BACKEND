import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { Role } from 'src/auth/enum/role.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // ✅ Send notification method
  async sendNotification({
    recipientId,
    message,
    type,
    role,
  }: {
    recipientId: string;
    message: string;
    type: 'SYSTEM' | 'ADMIN' | 'COUNSELOR';
    role: 'CLIENT' | 'COUNSELOR' | 'ADMIN';
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      recipientId,
      message,
      type,
      role,
    });
    return await this.notificationRepository.save(notification);
  }

  // (Optional) Fetch notifications
  async getNotificationsForUser(userId: string) {
    return await this.notificationRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAllAsRead(userId: string, role: Role) {
  await this.notificationRepository.update(
    { recipientId: userId, role, isRead: false },
    { isRead: true }
  );
}

async getunreadNotifications(userId: string, role: Role, onlyUnread = false) {
  const where: any = { recipientId: userId, role };

  if (onlyUnread) {
    where.read = false;
  }

  return this.notificationRepository.find({
    where,
    order: { createdAt: 'DESC' },
  });
}


}
