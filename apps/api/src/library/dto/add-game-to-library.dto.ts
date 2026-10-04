import { IsEnum, IsOptional,  } from 'class-validator';
import { GameStatus } from '../../generated/prisma/client';

export class AddGameToLibraryDto {

  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;
}