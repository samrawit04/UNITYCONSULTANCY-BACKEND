import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, VerifyAccountDto } from '../dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountVerification } from 'src/auth/entity/account-verification.entity';

import { AuthHelper } from 'src/auth/helper/auth.helper';
import { User } from 'src/auth/entity/user.entity';
import {
  AccountStatusEnum,
  AccountVerificationStatusEnum,
  AccountVerificationTypeEnum,
} from 'src/shared/enums';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  LoginResponseDto,
  ResendOtpDto,
  ResetPasswordDto,
} from 'src/auth/dto/login.dto';
import { EmailService } from './email.service';
import { Client } from 'src/client/entities/client.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { Role } from '../enum/role.enum';
import { NotificationService } from '../../Notification/service/notification.service';

export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AccountVerification)
    private readonly accountVerificationRepository: Repository<AccountVerification>,

    private readonly emailService: EmailService,
    private readonly helper: AuthHelper,
    
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Counselor)
    private readonly counselorRepository: Repository<Counselor>,

private readonly notificationService: NotificationService,

  ) {}

  public async createAccount(
    createUserDto: CreateUserDto,
  ): Promise<any | never> {
    const { email } = createUserDto;

    if (!email) {
      throw new BadRequestException('email is required.');
    }

    let user = await this.userRepository.findOne({
      where: [email ? { email: email.toLocaleLowerCase() } : null].filter(
        Boolean,
      ),
    });

    if (!user) {
      user = await this.createNewAccount(
        createUserDto,
        AccountStatusEnum.PENDING,
      );

      const verificationId = await this.createAndSendVerificationOTP(user);

      // ✅ Send notification after account creation
    let message = '';
    if (user.role === 'CLIENT') {
      message = 'Welcome to Unity! Your client account has been created.';
    } else if (user.role === 'COUNSELOR') {
      message = 'Thank you for registering. Please wait for admin approval.';
    }

    if (message) {
      await this.notificationService.sendNotification({
        recipientId: user.id,
        role: user.role,
        message,
        type: 'SYSTEM',
      });
    }
    
      return { verificationId };
    } else if (user.status == AccountStatusEnum.PENDING) {
      const verificationId = await this.createAndSendVerificationOTP(user);
      return { verificationId };
    } else if (user.email === createUserDto.email?.toLocaleLowerCase()) {
      throw new BadRequestException('email_already_exists');
    }

    throw new BadRequestException('conflict');
  }

  private async createNewAccount(
    createUserDto: CreateUserDto,
    status: AccountStatusEnum,
  ) {
    const { password, role } = createUserDto;

    const hashedPassword = this.helper.encodePassword(password);

    const user = this.userRepository.create({
      ...createUserDto,
      status: status,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Create related profile based on role
    if (role === Role.CLIENT) {
      const client = this.clientRepository.create({
        userId: savedUser.id,
      });

      await this.clientRepository.save({
        userId: user.id,
        client,
      });

    } else if (role === Role.COUNSELOR) {
      const counselor = this.counselorRepository.create({
        userId: savedUser.id,
      });
      await this.counselorRepository.save(counselor);
    }

    return user;
  }

  private async createAndSendVerificationOTP(user: User) {
    const { accountVerification, otp } = await this.createOTP(
      user,
      AccountVerificationTypeEnum.EMAIL_VERIFICATION,
    );

    const fullName = `${user.firstName} ${user.lastName}`;
    const OTP_LIFE_TIME = Number(process.env.OTP_LIFE_TIME ?? 2);

    let body: string;

    const VERIFICATION_METHOD = process.env.VERIFICATION_METHOD ?? 'OTP';

    if (VERIFICATION_METHOD == 'OTP') {
      body = this.verifyEmailTemplateForOtp(fullName, otp, OTP_LIFE_TIME);
    } else {
      body = `Link: ${accountVerification.otp}`;
    }

    await this.emailService.sendEmail(user.email, 'Email Verification', body);

    return accountVerification.id;
  }

  private async createOTP(
    user: User,
    otpType: AccountVerificationTypeEnum,
    userId?: string,
  ) {
    console.log('Creating OTP for:', user.email);

    const verificationExists =
      await this.accountVerificationRepository.findOneBy({
        user: { id: user.id },
        status: AccountVerificationStatusEnum.NEW,
        otpType,
      });

    if (verificationExists) {
      verificationExists.status = AccountVerificationStatusEnum.EXPIRED;
      await this.accountVerificationRepository.update(
        verificationExists.id,
        verificationExists,
      );
    }

    const otp = this.generateOpt();
    console.log('Generated OTP:', otp);

    const accountVerification: AccountVerification = new AccountVerification();
    accountVerification.user = user;
    accountVerification.otp = this.encodePassword(otp);
    accountVerification.otpType = otpType;
    accountVerification.userId = userId;
    (accountVerification.createdAt = new Date()),
      await this.accountVerificationRepository.save(accountVerification);
    return { accountVerification, otp };
  }

  async updateAccountStatus(userId: string, status: 'ACTIVE' | 'INACTIVE') {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.status = status;
    return this.userRepository.save(user);
  }

  async countByRole(role: Role): Promise<number> {
    return this.userRepository.count({ where: { role } });
  }

  // Generate OTP
  public generateOpt(): string {
    const randomNumber = randomInt(100000, 999999);

    return randomNumber.toString();
  }

  // Encode User's password
  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(12);

    return bcrypt.hashSync(password, salt);
  }

  public async forgetPassword(email: string) {
    email = email.toLocaleLowerCase();

    const account: User = await this.userRepository.findOneBy({ email });
    if (!account || account.status != AccountStatusEnum.ACTIVE) {
      throw new HttpException('something_went_wrong', HttpStatus.BAD_REQUEST);
    }

    const verificationId = await this.createAndSendForgetOTP(account);
    return { verificationId };
  }

  public async createAndSendForgetOTP(account: User) {
    const { accountVerification, otp } = await this.createOTP(
      account,
      AccountVerificationTypeEnum.RESET_PASSWORD,
    );

    const VERIFICATION_METHOD = process.env.VERIFICATION_METHOD ?? 'LINK';

    // Construct a clickable reset password link
    const FRONTEND_BASE_URL =
      process.env.FRONTEND_BASE_URL ?? 'http://localhost:8080';

    const resetLink = `${FRONTEND_BASE_URL}/reset-form?token=${accountVerification.otp}`;

    const body = `Click the link to reset your password: <a href="${resetLink}">${resetLink}</a>`;

    await this.emailService.sendEmail(account.email, 'Reset Password', body);

    return accountVerification.id;
  }

  async resetPassword({
    newPassword,
    confirmPassword,
    token,
  }: ResetPasswordDto) {
    // 1️⃣ Find the verification entry
    const verification = await this.accountVerificationRepository.findOne({
      where: { otp: token },
      relations: ['user'],
    });

    if (!verification) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (verification.status === AccountVerificationStatusEnum.USED) {
      throw new HttpException(
        'This reset link has already been used',
        HttpStatus.BAD_REQUEST,
      );
    }

    //  Find the user
    const user = verification.user;
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('the password does not match ');
    }

    user.password = this.helper.encodePassword(newPassword);
    await this.userRepository.save(user);

    // Invalidate the OTP after successful password reset
    await this.accountVerificationRepository.update(
      { id: verification.id },
      { status: AccountVerificationStatusEnum.USED },
    );

    return { message: 'Password reset successful' };
  }

  async resendOtp(payload: ResendOtpDto) {
    const invitation = await this.accountVerificationRepository.findOne({
      where: {
        id: payload.verificationId,
      },
      relations: {
        user: true,
      },
    });

    if (!invitation) {
      throw new HttpException('verification_not_found', HttpStatus.NOT_FOUND);
    }

    const OTP_LIFE_TIME = Number(process.env.OTP_LIFE_TIME ?? 2);
    const otpLifetimeMs = OTP_LIFE_TIME * 60 * 1000;
    const currentTime = new Date().getTime();
    const invitationTime = invitation.createdAt.getTime();

    // If OTP is still valid (not expired), return early.
    if (currentTime - invitationTime < otpLifetimeMs) {
      // Optionally, you can return a message saying the OTP is still valid.
      return { message: 'OTP is still valid and has not expired yet.' };
    }

    // If the invitation status is USED, do not resend.
    if (invitation.status === AccountVerificationStatusEnum.USED) {
      throw new HttpException(
        'verification_already_used',
        HttpStatus.NOT_FOUND,
      );
    }

    // Mark the current OTP as expired
    await this.accountVerificationRepository.update(invitation.id, {
      status: AccountVerificationStatusEnum.EXPIRED,
    });

    // Create and send a new OTP
    const newVerificationId = await this.createAndSendVerificationOTP(
      invitation.user,
    );

    return { verificationId: newVerificationId };
  }

  public async verifyAccount(body: VerifyAccountDto) {
    const { verificationId, otp, isOtp }: VerifyAccountDto = body;

    // Verify OTP and get the user account
    const account = await this.verifyOTP(verificationId, otp, isOtp);

    // Activate the account
    account.status = AccountStatusEnum.ACTIVE;
    await this.userRepository.update(account.id, account);

    // Prepare payload for JWT token
    const tokenPayload = {
      id: account.id,
      email: account.email,
    };

    // Generate access and refresh tokens
    const token: LoginResponseDto = {
      access_token: this.helper.generateAccessToken(tokenPayload),
      refresh_token: this.helper.generateRefreshToken({ id: account.id }),
    };

    // Return success message, role, and tokens
    return {
      message: 'Account successfully verified and activated.',
      role: account.role,
      token, // <-- Include tokens here
    };
  }

  private async verifyOTP(
    verificationId: string,
    otp: string,
    isOtp: boolean,
    invalidateOtp = true,
  ) {
    const OTP_LIFE_TIME_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

    const accountVerification =
      await this.accountVerificationRepository.findOne({
        where: {
          id: verificationId,
          status: AccountVerificationStatusEnum.NEW,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    console.log('OTP retrieved for verification:', accountVerification?.otp);
    console.log('OTP status:', accountVerification?.status);
    console.log('OTP createdAt:', accountVerification?.createdAt);

    if (!accountVerification) {
      throw new HttpException(
        'verification_token_not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if OTP has expired
    const currentTime = new Date().getTime();
    const createdTime = accountVerification.createdAt.getTime();

    if (currentTime - createdTime > OTP_LIFE_TIME_MS) {
      await this.accountVerificationRepository.update(accountVerification.id, {
        status: AccountVerificationStatusEnum.EXPIRED,
      });
      throw new HttpException(
        'verification_token_expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check OTP validity
    if (
      isOtp &&
      !this.helper.compareHashedValue(otp, accountVerification.otp)
    ) {
      throw new HttpException(
        'invalid_verification_token',
        HttpStatus.BAD_REQUEST,
      );
    } else if (!isOtp && accountVerification.otp !== otp) {
      throw new HttpException(
        'invalid_verification_token',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Invalidate OTP after successful verification
    if (invalidateOtp) {
      await this.accountVerificationRepository.update(accountVerification.id, {
        status: AccountVerificationStatusEnum.USED,
      });
    }

    const account = await this.userRepository.findOneBy({
      id: accountVerification.userId,
    });
    if (!account) {
      throw new HttpException('account_not_found', HttpStatus.NOT_FOUND);
    }
    return account;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (!email) {
      throw new BadRequestException('Either email or phone number is required');
    }

    const user: User = await this.userRepository.findOne({
      where: [email ? { email } : null].filter(Boolean),
    });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
    };

    const token: LoginResponseDto = {
      access_token: this.helper.generateAccessToken(tokenPayload),
      refresh_token: this.helper.generateRefreshToken({
        id: user.id,
      }),
    };
    return {
      token,
      role: user.role,
      id: user.id,
    };
  }

  public verifyEmailTemplateForOtp(
    fullName: string,
    otp: string,
    duration: number,
  ) {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
      <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="height: 0;">
              <td>
              </td>
              <td style="text-align: right;">
                <span
                  style="font-size: 16px; line-height: 30px; color: #ffffff;"
                  >Oct 20, 2023</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <div
          style="
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto;">
            <p
              style="
                margin: 0;
                margin-top: 5px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              Hey ${fullName},
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              Use the following OTP
              to complete the procedure to verify your email address. OTP is
              valid for
              <span style="font-weight: 600; color: #1f1f1f;">${duration} minutes</span>.
              Do not share this code with others.
            </p>
           
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              Your OTP
            </p>
            <p
              style="
                font-size: 40px;
                font-weight: 600;
                letter-spacing: 25px;
                color: #fafafa;
                background-color: #0d7801;
              "
            >
              ${otp}
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 90px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:megp@gmail.com"
            style="color: #499fb6; text-decoration: none;"
            >megp@gmail.com</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #499fb6; text-decoration: none;"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 40px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
          egp Malawi
        </p>
        <p style="margin: 0; margin-top: 8px; color: #434343;">
          Lilongwe 3, Malawi.
        </p>
        <div style="margin: 0; margin-top: 16px;">
          <a href="" target="_blank" style="display: inline-block;">
            <img
              width="36px"
              alt="Facebook"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"
            />
          </a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Instagram"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"
          /></a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Twitter"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter"
            />
          </a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Youtube"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"
          /></a>
        </div>
        <p style="margin: 0; margin-top: 16px; color: #434343;">
          Copyright © 2022 Company. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>
`;
  }
}
