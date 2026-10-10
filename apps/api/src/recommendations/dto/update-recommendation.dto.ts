import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import {
  RecommendationAspectType,
} from '../../generated/prisma/client';

export class UpdateRecommendationDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  body?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(
    RecommendationAspectType,
    {
      each: true,
    },
  )
  aspects?: RecommendationAspectType[];
}