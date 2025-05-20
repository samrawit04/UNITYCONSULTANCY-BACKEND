import { Client } from 'src/client/entities/client.entity';
import { Counselor } from './counselor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (client) => client.ratings, { onDelete: 'CASCADE' })
  client: Client;

  @ManyToOne(() => Counselor, (counselor) => counselor.ratings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'counselorId' })
  counselor: Counselor;

  @Column({ nullable: true })
  counselorId?: string;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'int' })
  score: number;

  @CreateDateColumn()
  createdAt: Date;
}
