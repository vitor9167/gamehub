import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';

import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    RatingsController,
  ],

  providers: [
    RatingsService,
    PrismaService,
  ],
})
export class RatingsModule {}