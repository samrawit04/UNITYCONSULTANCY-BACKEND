import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  TableInheritance,
  OneToOne,
} from 'typeorm';
import { AccountStatusEnum } from '../../shared/enums/account-status.enum';
import { AccountVerification } from './account-verification.entity';
import { Client } from 'src/client/entities/client.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { Role } from '../enum/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // Ensure it's UUID if you want consistency
  id!: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role?: Role;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    default: AccountStatusEnum.PENDING,
  })
  status: string;

  @Column({ nullable: true })
  googleId?: string;

  @OneToMany(
    () => AccountVerification,
    (accountVerification) => accountVerification.user,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  accountVerifications: AccountVerification[];

  @OneToOne(() => Client, (client) => client.user)
  client?: Client;

  @OneToOne(() => Counselor, (counselor) => counselor.user)
  counselor?: Counselor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
