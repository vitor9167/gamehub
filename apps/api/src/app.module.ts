import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaService } from './prisma/prisma.service';

import { GamesModule } from './games/games.module';
import { IgdbModule } from './igdb/igdb.module';
import { LibraryModule } from './library/library.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { RatingsModule } from './ratings/ratings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    GamesModule,
    IgdbModule,
    LibraryModule,
    AuthModule,
    AdminModule,
    RatingsModule,
    ReviewsModule,
    UsersModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
    PrismaService,
  ],
})
export class AppModule {}