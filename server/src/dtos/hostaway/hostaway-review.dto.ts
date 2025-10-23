import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

/**
 * information here is from the provided mocked response
 * and hostaway api documentation on https://api.hostaway.com/documentation?shell#review-object
 */

export enum HostawayReviewType {
  HostToGuest = "host-to-guest",
  GuestToHost = "guest-to-host",
}

/**
 * This controls what review is displayed on public website.
 * Only published reviews are displayed
 */
export enum HostawayReviewStatus {
  Published = "published",
  Awaiting = "awaiting",
}

export enum HostawayReviewCategory {
  Cleanliness = "cleanliness",
  Communication = "communication",
  RespectHouseRules = "respect_house_rules",
}

export enum HostawayReviewChannel {
  AirbnbOfficial = 2018,
  Homeaway = 2002,
  Bookingcom = 2005,
  Expedia = 2007,
  Homeawayical = 2009,
  Vrboical = 2010,
  Direct = 2000,
  Bookingengine = 2013,
  CustomIcal = 2015,
  Tripadvisorical = 2016,
  Wordpress = 2017,
  Marriott = 2019,
  Partner = 2020,
  Gds = 2021,
  Google = 2022,
}

class HostawayReviewCategoryRatingDto {
  category!: HostawayReviewCategory;

  @Type(() => Number)
  rating!: 10;
}

// validation doesn't need to happen on this as it's data is from an API call
export class HostawayReviewDto {
  @Type(() => Number)
  id!: number;

  /**
   * Basically listingId (or at least, what I'm using it as)
   */
  @Type(() => Number)
  listingMapId!: number;

  /*
   * not important since we already have listingMapId,
   * leaving it here since it's in provided mock and hostaway doc
   */
  listingName!: string;

  type!: HostawayReviewType;

  status!: HostawayReviewStatus;

  /*
   * "Filter or sort by rating, category, channel, or time" - part of task
   * This means we need to know what channed each review is from
   */
  /**
   * What channel the review each from. Each channel is mapped to a number
   * source: https://api.hostaway.com/documentation?shell#reservation-channels
   */
  channelId!: HostawayReviewChannel;

  // I don't think a review should exist without rating
  @Type(() => Number)
  rating!: number;

  /* A review should be able to exist without publicReview
   * The "review.rating" is enough to understand customer's sentiment
   */
  publicReview?: string;

  @Type(() => HostawayReviewCategoryRatingDto)
  @IsOptional()
  reviewCategory?: HostawayReviewCategoryRatingDto[];

  @Type(() => Date)
  submittedAt!: Date;

  guestName!: string;
}
