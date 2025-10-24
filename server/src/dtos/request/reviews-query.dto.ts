import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";
import {
  HostawayReviewCategory,
  HostawayReviewChannel,
  HostawayReviewType,
} from "../hostaway/hostaway-review.dto";
import {
  transformStringToIntArray,
  transformStringToStringArray,
} from "../../util/func";

export enum SortBy {
  Rating = "Rating",
  SubmittedAt = "submittedAt",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export class ReviewsQueryDto {
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    {
      message: "Please provide a valid listing.",
    }
  )
  @IsOptional()
  listingId?: number;

  @IsEnum(HostawayReviewType, {
    message: "Please provide a valid review type.",
  })
  @IsOptional()
  type?: HostawayReviewType;

  @Transform(transformStringToIntArray)
  @IsEnum(HostawayReviewChannel, {
    message: "Please provide a valid review channel(s).",
    each: true,
  })
  @IsOptional()
  channels?: HostawayReviewChannel[];

  @Type(() => Date)
  @IsDate({
    message: "Please provide a valid start date.",
  })
  @IsOptional()
  from?: Date;

  @Type(() => Date)
  @IsDate({
    message: "Please provide a valid end date.",
  })
  @IsOptional()
  to?: Date;

  @Type(() => Number)
  @Min(0, { message: "Please provide rating within range 1 - 10" })
  @Max(0, { message: "Please provide rating within range 1 - 10" })
  @IsOptional()
  minRating?: number;

  @Transform(transformStringToStringArray)
  @IsEnum(HostawayReviewCategory, {
    message: "Please provide valid review categorie(s).",
    each: true,
  })
  @IsOptional()
  categories?: HostawayReviewCategory[];

  @IsEnum(SortBy, {
    message: "Please provide a valid value to sort review by.",
  })
  @IsOptional()
  sortBy: SortBy = SortBy.SubmittedAt;

  @IsEnum(SortOrder, {
    message: "Please provide a valid value for review sorting direction.",
  })
  @IsOptional()
  sortOrder: SortOrder = SortOrder.Desc;

  /**
   * fetched everything if limit is not provided,
   * we can do this because we know our reviews are not much,
   * in 10s basically
   */
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    {
      message: "Please provide a valid value to limit reviews.",
    }
  )
  @IsOptional()
  limit?: number;

  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    {
      message: "Please provide a valid value to skip some reviews.",
    }
  )
  @IsOptional()
  offset: number = 0;
}
