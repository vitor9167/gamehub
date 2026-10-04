import { IsEnum } from 'class-validator';
import { GameStatus } from '../../generated/prisma/client';

export class UpdateLibraryStatusDto {
  @IsEnum(GameStatus)
  status: GameStatus;
}