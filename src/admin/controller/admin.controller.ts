import { Controller, Get, Patch, Param } from '@nestjs/common';
import { AdminService } from '../service/admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // View all users (clients + counselors)
 @Get('clients')
getAllClients() {
  return this.adminService.getAllClients();
}

  // Activate or Deactivate a Counselor
  @Patch('counselor/:id/status/:status')
  toggleCounselorStatus(
    @Param('id') userId: string,
    @Param('status') status: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.adminService.setCounselorStatus(userId, status);
  }

  @Get('counselors')
getAllCounselors() {
  return this.adminService.getAllCounselorsWithStatus();
}

  // Approve Counselor
  @Patch('counselor/:id/approve')
  approveCounselor(@Param('id') userId: string) {
    return this.adminService.approveCounselor(userId);
  }
}
