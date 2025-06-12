import { BadRequestException, Body, Controller, Post } from '@nestjs/common';

import { CreateUserDto, VerifyAccountDto } from '../dto/user.dto';
import {
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
} from 'src/auth/dto/login.dto';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async createAccount(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.userService.createAccount(createUserDto);
      return {
        success: true,
        verificationId: result.verificationId,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('resend-otp')
  async resendOtp(@Body() payload: ResendOtpDto) {
    return this.userService.resendOtp(payload);
  }

  @Post('verifyAccount')
  async verifyAccount(@Body() verifyAccountDto: VerifyAccountDto) {
    return this.userService.verifyAccount(verifyAccountDto);
  }

  @Post('/signin')
  async login(@Body() loginDto: LoginDto) {
    
      const token = await this.userService.login(loginDto);
      return { success: true, token };
  }

  @Post('forget-password')
  async forgetPassword(@Body() body: { email: string }) {
    return this.userService.forgetPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }
}
