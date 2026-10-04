import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IgdbService } from './igdb.service';
import { IgdbController } from './igdb.controller';

@Module({
  imports: [HttpModule],
  providers: [IgdbService],
  exports: [IgdbService],
  controllers: [IgdbController],
})
export class IgdbModule {}