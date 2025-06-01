import { IsUUID, IsString, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  recipientId: string;

  @IsString()
  message: string;

  @IsEnum(['SYSTEM', 'ADMIN', 'COUNSELOR'])
  type: 'SYSTEM' | 'ADMIN' | 'COUNSELOR';

  @IsEnum(['CLIENT', 'COUNSELOR', 'ADMIN'])
  role: 'CLIENT' | 'COUNSELOR' | 'ADMIN';
}
