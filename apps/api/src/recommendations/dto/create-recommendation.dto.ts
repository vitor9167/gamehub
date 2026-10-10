import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

import {
  RecommendationAspectType,
} from '../../generated/prisma/client';

export class CreateRecommendationDto {
  @IsUUID()
  sourceGameId: string;

  @IsUUID()
  recommendedGameId: string;

  @IsString()
  @MinLength(10)
  body: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(
    RecommendationAspectType,
    {
      each: true,
    },
  )
  aspects: RecommendationAspectType[];
}