import { Controller, Get, Param, Query,ParseIntPipe } from '@nestjs/common';
import { IgdbService } from './igdb.service';

@Controller('igdb')
export class IgdbController {
  constructor(private readonly igdbService: IgdbService) {}

  @Get('search')
  search(@Query('q') query: string) {
    return this.igdbService.searchGames(query);
  }

  @Get('game/:id')
  getGame(@Param('id', ParseIntPipe)
id: number) {
    return this.igdbService.getGameById(Number(id));
  }
}