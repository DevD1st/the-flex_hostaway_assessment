import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

// we're only dealing with Apartment
export enum HostawayListingType {
  apartment = "Apartment",
}

export enum HostawayListingAllowable {
  Allowed = "allowed",
  NotAllowed = "not allowed",
}

export class HostawayListingImageDto {
  caption?: string;

  url!: string;
}

export class HostawayListingDto {
  @Type(() => Number)
  id!: number;

  type!: HostawayListingType;

  name!: string;

  description!: string;

  address?: string;

  @Type(() => Number)
  @IsOptional()
  averageReviewRating?: number;

  @Type(() => Number)
  @IsOptional()
  reviewCount?: number;

  @Type(() => Number)
  personCapacity!: number;

  @Type(() => Number)
  lat!: number;

  @Type(() => Number)
  lng!: number;

  @Type(() => Number)
  checkInTimeStart!: number;

  @Type(() => Number)
  @IsOptional()
  checkInTimeEnd?: number;

  @Type(() => Number)
  checkOutTimeStart!: number;

  pets!: HostawayListingAllowable;

  smokingInside!: HostawayListingAllowable;

  @Type(() => Number)
  bathroomsNumber!: number;

  @Type(() => Number)
  bedroomsNumber!: number;

  cancellationPolicy!: string;

  /*
   * it is {}[] in doc, but we'll be using string[]
   * because we don't have access to the ids, icons
   * and other info used for this in the documentation
   */
  listingAmenities?: string[];

  listingImages!: HostawayListingImageDto[];
}
