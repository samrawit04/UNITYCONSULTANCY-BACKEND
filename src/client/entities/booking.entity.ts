// src/booking/entities/booking.entity.ts
import { Availability } from 'src/counselor/entities/availability.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Client } from './client.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Counselor, (counselor) => counselor.bookings)
  counselor: Counselor;

  @ManyToOne(() => Client, (client) => client.bookings)
  client: Client;

  @ManyToOne(() => Availability, (availability) => availability.bookings, {
    eager: true,
  })
  availability: Availability;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: Date;

  @Column({ type: 'time' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
