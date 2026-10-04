import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  body: string;

  @IsOptional()
  @IsBoolean()
  isSpoiler?: boolean;
}