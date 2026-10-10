import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET,
    }),
  ],

  controllers: [
    RecommendationsController,
  ],

  providers: [
    RecommendationsService,
    PrismaService,
  ],
})
export class RecommendationsModule {}