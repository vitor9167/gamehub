import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Delete, Query,UseGuards,} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { FindGamesDto } from './dto/find-games.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

@Get()
findAll(
  @Query("search")
  search?: string,

  @Query("genre")
  genre?: string,

  @Query("platform")
  platform?: string,

  @Query("page")
  page?: string,

  @Query("limit")
  limit?: string,

  @Query("sort")
sort?: "title" | "recent" | "release",
) {
  return this.gamesService.findAll({
    search,
    genre,
    platform,
    page:
      Number(page) || 1,
    limit:
      Number(limit) || 12,
    sort,
  });
}

  @Get('filters')
  getFilters() {
  return this.gamesService.getFilters();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
  return this.gamesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe)
  id: string,) {
    return this.gamesService.findOne(id);
  }

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }
@Patch(':id')
update(
 @Param('id', ParseUUIDPipe)
  id: string,
  @Body() updateGameDto: UpdateGameDto,
) {
  return this.gamesService.update(id, updateGameDto);
}

@Delete(':id')
remove(@Param('id', ParseUUIDPipe)
  id: string,) {
  return this.gamesService.remove(id);
}

@UseGuards(AuthGuard, AdminGuard)
@Post('import/igdb/:id')
importFromIgdb(@Param('id', ParseIntPipe) id: number) {
  return this.gamesService.importFromIgdb(id);
}



  
}
