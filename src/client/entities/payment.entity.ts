import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Client } from './client.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (client) => client.payments)
  client: Client;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true })
  scheduleId: string;

  @ManyToOne(() => Counselor, (counselor) => counselor.payments)
  counselor: Counselor;

  @Column({ nullable: true })
  counselorId: string;

  @Column({ nullable: true })
  amount: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  transactionReference: string;

  @Column({ nullable: true })
  chapaRedirectUrl: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  paymentChannel: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  chapaFees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountReceived: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  verifiedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
