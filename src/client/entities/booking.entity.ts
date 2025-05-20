import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Schedule } from 'src/counselor/entities/schedule.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Schedule)
  schedule: Schedule;

  @Column()
  scheduleId: number;

  @ManyToOne(() => Counselor)
  counselor: Counselor;

  @Column()
  counselorId: number;

  @Column()
  clientName: string;

  @Column()
  clientEmail: string;

  @CreateDateColumn()
  createdAt: Date;
}
