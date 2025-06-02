// src/notifications/notification.controller.ts
import { Controller, Post, Body, Get, Query, Patch } from '@nestjs/common';
import { NotificationService } from '../service/notification.service';
import { CreateNotificationDto } from '../dto/create-notificatio.dto';
import { Role } from 'src/auth/enum/role.enum';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.sendNotification(dto);
  }

  @Patch('mark-read')
markAsRead(@Body() body: { userId: string; role: Role }) {
  return this.notificationService.markAllAsRead(body.userId, body.role);
}

@Get('unread')
getunread(
  @Query('role') role: Role,
  @Query('userId') userId: string,
  @Query('unreadOnly') unreadOnly: string
) {
  const onlyUnread = unreadOnly === 'true';
  return this.notificationService.getunreadNotifications(userId, role, onlyUnread);
}


  @Get()
  getByRole(
    @Query('role') role: 'CLIENT' | 'COUNSELOR' | 'ADMIN',
    @Query('userId') userId?: string,
  ) {
    return this.notificationService.getNotificationsForUser(userId);
  }
}
