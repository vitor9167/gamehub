import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    AdminController,
  ],
  providers: [
    AdminService,
    PrismaService,
    AdminGuard,
  ],
})
export class AdminModule {}