import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    LibraryController,
  ],

  providers: [
    LibraryService,
    PrismaService,
  ],
})
export class LibraryModule {}