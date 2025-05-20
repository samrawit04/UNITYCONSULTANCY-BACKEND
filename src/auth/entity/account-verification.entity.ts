import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  AccountVerificationStatusEnum,
  AccountVerificationTypeEnum,
} from '../../shared/enums';
import { Audit } from 'src/shared/entities/audit.entity';
import { User } from './user.entity';
@Entity('account_verifications')
export class AccountVerification extends Audit {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'text' })
  public otp: string;

  @Column({
    type: 'enum',
    enum: AccountVerificationStatusEnum,
    default: AccountVerificationStatusEnum.NEW,
  })
  public status: string;

  @Column({
    type: 'enum',
    enum: AccountVerificationTypeEnum,
    default: AccountVerificationTypeEnum.EMAIL_VERIFICATION,
  })
  public otpType: string;

  @ManyToOne(() => User, (user) => user.accountVerifications)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({ type: 'text', nullable: true })
  public userId: string;
}
