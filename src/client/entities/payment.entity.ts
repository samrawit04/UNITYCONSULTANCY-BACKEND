import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Counselor } from '../../counselor/entities/counselor.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  transactionReference: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar' })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.payments)
  client: Client;

  @Column({ type: 'varchar' })
  counselorId: string;

  @ManyToOne(() => Counselor, (counselor) => counselor.payments)
  counselor: Counselor;

  @Column({ type: 'varchar' })
  scheduleId: string;

  @Column({ type: 'varchar', nullable: true })
  chapaCheckoutUrl: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountReceived?: number;

  @Column({ type: 'varchar', nullable: true })
  paymentChannel?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  chapaFees?: number;
}