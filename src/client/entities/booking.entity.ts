import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Schedule } from 'src/counselor/entities/schedule.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { Client } from './client.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Schedule)
  schedule: Schedule;

  @Column()
  scheduleId: string;


  @ManyToOne(() => Client, (client) => client.bookings)
  client: Client;

  @Column()
  clientId: string;

  @CreateDateColumn()
  createdAt: Date;
}
