import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get('health/db')
  async checkDatabase() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      application: 'GameHub API',
      status: 'online',
      database: 'connected',
    };
  }
}