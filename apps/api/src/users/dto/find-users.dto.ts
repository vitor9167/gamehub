import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

import { Type } from "class-transformer";

export class FindUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 12;
}