import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Counselor } from './counselor.entity';
import { Booking } from 'src/client/entities/booking.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Counselor, (counselor) => counselor.schedules)
  @JoinColumn({ name: 'counselorId' })
  counselor: Counselor;

  @Column({ type: 'uuid' })
  counselorId: string;

  @OneToMany(() => Booking, (booking) => booking.schedule)
  bookings: Booking[];
}
