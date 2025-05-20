// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

require('dotenv').config();

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
    return transporter;
  }

  async sendEmail(email: string, subject: string, body: string) {
    const transport = this.emailTransport();
    const options: nodemailer.sendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: subject,
      html: body,
    };

    try {
      await transport.sendMail(options);
      console.log('Email sent successfully');
    } catch (error) {
      console.log('Error sending mail: ', error);
    }
  }

  
}
