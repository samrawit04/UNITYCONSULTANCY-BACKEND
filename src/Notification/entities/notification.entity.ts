import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipientId: string;

  @Column()
  message: string;

  @Column({ default: false })
isRead: boolean;

  @Column()
  type: 'SYSTEM' | 'ADMIN' | 'COUNSELOR';

  @Column()
  role: 'CLIENT' | 'COUNSELOR' | 'ADMIN';

  @CreateDateColumn()
  createdAt: Date;
}
