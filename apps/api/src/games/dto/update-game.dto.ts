import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;
}