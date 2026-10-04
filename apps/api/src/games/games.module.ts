import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma/prisma.service';
import { IgdbModule } from '../igdb/igdb.module';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  imports: [IgdbModule, AuthModule,],
  controllers: [GamesController],
  providers: [GamesService, PrismaService, AdminGuard ],
})


export class GamesModule {}