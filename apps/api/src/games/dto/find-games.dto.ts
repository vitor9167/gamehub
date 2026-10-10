import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class FindGamesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;


    @IsOptional()
  @IsString()
  @IsIn([
    'title',
    'recent',
    'release',
  ])
  sort?: 'title' | 'recent' | 'release';
}
