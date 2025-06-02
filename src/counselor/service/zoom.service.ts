// src/zoom/zoom.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);

  private clientId = process.env.ZOOM_CLIENT_ID;
  private clientSecret = process.env.ZOOM_CLIENT_SECRET;
  private accountId = process.env.ZOOM_ACCOUNT_ID;

  constructor(private readonly httpService: HttpService) {}

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );

    const { data } = await firstValueFrom(
      this.httpService.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      ),
    );

    return data.access_token;
  }

  async createMeeting({
    topic,
    startTime,
    duration,
    timezone = 'UTC',
  }: {
    topic: string;
    startTime: string; // ISO string
    duration: number; // in minutes
    timezone?: string;
  }): Promise<{ join_url: string; start_url: string }> {
    const token = await this.getAccessToken();

    const { data } = await firstValueFrom(
      this.httpService.post(
        `https://api.zoom.us/v2/users/me/meetings`,
        {
          topic,
          type: 2, // Scheduled
          start_time: startTime,
          duration,
          timezone,
          settings: {
            join_before_host: false,
            approval_type: 0,
            meeting_authentication: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return {
      join_url: data.join_url,
      start_url: data.start_url,
    };
  }
}
