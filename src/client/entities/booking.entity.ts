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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Schedule)
  schedule: Schedule;

  @Column()
  scheduleId: string;

  @ManyToOne(() => Counselor)
  counselor: Counselor;

  @Column()
  counselorId: string;

  @Column()
  clientName: string;

  @Column()
  clientEmail: string;

  @CreateDateColumn()
  createdAt: Date;
}
