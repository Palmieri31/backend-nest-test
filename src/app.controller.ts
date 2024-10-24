import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RolesGuard } from './roles/roles.guard';
import { RoleValue } from './roles/role.enum';
import { Roles } from './roles/roles.decorator';
import { AuthGuard } from './auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleValue.Admin)
  getHello(): string {
    return this.appService.getHello();
  }
}
