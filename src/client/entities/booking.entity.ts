import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Schedule } from 'src/counselor/entities/schedule.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { Client } from './client.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Schedule, (schedule) => schedule.bookings)
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @Column()
  scheduleId: string;

  @ManyToOne(() => Client, (client) => client.bookings)
  client: Client;

  @Column()
  clientId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  zoomJoinUrl: string;

  @Column({ nullable: true })
  zoomStartUrl: string;
}
