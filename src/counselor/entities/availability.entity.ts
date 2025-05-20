import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Counselor } from './counselor.entity';
import { Booking } from 'src/client/entities/booking.entity';

@Entity()
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Counselor, (counselor) => counselor.availabilities, {
    onDelete: 'CASCADE',
  })
  counselor: Counselor;

  @Column({ type: 'time' }) // e.g., '2025-04-16'
  date: Date;

  @Column({ type: 'time' })
  startTime: Date; // e.g., '08:00'

  @Column({ type: 'time' })
  endTime: Date; // '09:00'

  @OneToMany(() => Booking, (booking) => booking.availability)
  bookings: Booking[];

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
