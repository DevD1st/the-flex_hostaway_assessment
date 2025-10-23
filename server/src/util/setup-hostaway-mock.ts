import axios from "axios";
import {
  API_ADMIN_TOKEN,
  HOSTAWAY_LISTING_URL,
  HOSTAWAY_REVIEWS_URL,
} from "./config";
import { MOCKED_LISTINGS } from "./mocked-listings";
import { MOCKED_REVIEWS } from "./mocked-reviews";
import {
  HostawayResponseDto,
  HostawayResponseStatus,
} from "../dtos/hostaway/hostaway-response.dto";
import { plainToInstance } from "class-transformer";
import { HostawayReviewStatus } from "../dtos/hostaway/hostaway-review.dto";

/**
 * Extract id from a url. i.e https://a.com/1 - returns 1
 * @param url the string to extract the id from - i.e https://a.com/1
 * @param baseURL the beginnig part of the url that doesn't contain an id - i.e https://a.com
 * @returns the id or null
 */
function getUrlId(url: string, baseURL: string) {
  // extract id
  const afterMainURL = url.split(baseURL)[1];
  if (!afterMainURL) return null;

  const urlId = afterMainURL.startsWith("/")
    ? parseInt(afterMainURL.split("/")[1])
    : parseInt(afterMainURL);
  if (!urlId) return null;

  return urlId;
}

// you either fetch all or one listing, there is no search param
/**
 * Fetch all listings. We don't filter since it's a mock and we know we only have so many listings
 * @param _url request url
 * @returns all listings
 */
function fetchMockedListings(_url: string) {
  // we don't need to filter/parse since we know this is a mock and we only have 6 listings
  return new HostawayResponseDto({
    result: MOCKED_LISTINGS,
    offset: 0,
    count: MOCKED_LISTINGS.length,
    status: HostawayResponseStatus.Success,
  });
}

// the url here should contain an /:id
/**
 * Fetch a single listing by id
 * @param url url
 * @returns listing
 */
function fetchMockedListing(url: string) {
  // extract property id
  const listingId = getUrlId(url, HOSTAWAY_LISTING_URL);
  if (!listingId) return null;

  return new HostawayResponseDto({
    // I'm not parsing here since I'm not meant to be able to parse here with real data
    result: MOCKED_LISTINGS.find(({ id }) => listingId === id),
    count: 1,
    offset: 0,
    status: HostawayResponseStatus.Success,
  });
}

// the url here should contain an /:id
/**
 * Fetch a single review by id
 * @param url url
 * @param isAdmin does this req originate from an admin? NB: admin can fetch all reviews, others can only fetch public reviews
 * @returns listing
 */
function fetchMockedReview(url: string, isAdmin: boolean = false) {
  // extract property id
  const reviewId = getUrlId(url, HOSTAWAY_REVIEWS_URL);
  if (!reviewId) return null;

  let result = MOCKED_REVIEWS.find(({ id }) => reviewId === id);

  if (result && !isAdmin && result.status !== HostawayReviewStatus.Published)
    result = undefined;

  return new HostawayResponseDto({
    // I'm not parsing here since I'm not meant to be able to parse here with real data
    result,
    count: result ? 1 : 0,
    offset: 0,
    status: HostawayResponseStatus.Success,
  });
}

/**
 * Filter and fetch reviews by dto/search params
 * @param url request url
 * @param isAdmin does this req originate from an admin? NB: admin can fetch all reviews, others can only fetch public reviews
 * @returns matching reviews
 */
function fetchMockedReviews(url: string, isAdmin: boolean = false) {
  const queries = new URL(url).searchParams;

  /**
   * The API (hostaway) isn't aware of our dto (ReviewsQueryDto)
   * so there is no need to tightly couple them
   */
  const offset = queries.get("offset");
  const limit = queries.get("limit");

  // Parse query params according to ReviewsQueryDto
  const listingIdParam = queries.get("listingId");
  const type = queries.get("type");
  // channels may be provided as repeated params or comma separated
  const channelsParam = queries.getAll("channels").length
    ? queries.getAll("channels")
    : queries.get("channels");
  const fromParam = queries.get("from");
  const toParam = queries.get("to");
  const minRatingParam = queries.get("minRating");
  // categories may be provided repeated or comma separated
  const categoriesParam = queries.getAll("categories").length
    ? queries.getAll("categories")
    : queries.get("categories");
  const sortBy = queries.get("sortBy");
  const sortOrder = queries.get("sortOrder");

  const listingId = listingIdParam ? parseInt(listingIdParam, 10) : undefined;
  const channels = Array.isArray(channelsParam)
    ? channelsParam.map((c) => (isNaN(Number(c)) ? c : Number(c)))
    : channelsParam
    ? channelsParam.split(",").map((c) => (isNaN(Number(c)) ? c : Number(c)))
    : undefined;
  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(toParam) : undefined;
  const minRating = minRatingParam ? parseInt(minRatingParam, 10) : undefined;
  const categories = Array.isArray(categoriesParam)
    ? categoriesParam
    : categoriesParam
    ? String(categoriesParam).split(",")
    : undefined;

  // We'll sort the entire mocked list first to ensure stable ordering before filtering/pagination
  let working = MOCKED_REVIEWS.slice();

  // Sorting entire dataset first
  if (sortBy) {
    const dir = sortOrder && String(sortOrder).toLowerCase() === "asc" ? 1 : -1;
    if (sortBy === "Rating" || String(sortBy).toLowerCase() === "rating") {
      working = working.sort((a, b) => dir * (a.rating - b.rating));
    } else {
      // default: submittedAt
      working = working.sort(
        (a, b) =>
          dir *
          (new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime())
      );
    }
  }

  // Filter based on parsed params. Note: mocked reviews use 'listingMapId', 'channelId', 'rating', 'type', 'reviewCategory' and 'submittedAt'
  let filtered = working.filter((review) => {
    if (!isAdmin && review.status !== HostawayReviewStatus.Published)
      return false;

    // listingId -> listingMapId
    if (typeof listingId === "number" && review.listingMapId !== listingId)
      return false;

    if (type && review.type !== type) return false;

    if (channels && channels.length) {
      // channels might be numbers (channelId) or enum strings; compare both
      const chanMatches = channels.some((c) =>
        typeof c === "number"
          ? review.channelId === c
          : String(review.channelId) === String(c)
      );
      if (!chanMatches) return false;
    }

    if (typeof minRating === "number" && review.rating < minRating)
      return false;

    if (categories && categories.length) {
      // review.reviewCategory is an array of objects with { category }
      const reviewCats = (review.reviewCategory || []).map((rc) => rc.category);
      const hasAny = categories.some((c) => reviewCats.includes(c));
      if (!hasAny) return false;
    }

    if (from) {
      const submitted = new Date(review.submittedAt);
      if (isNaN(submitted.getTime()) || submitted < from) return false;
    }

    if (to) {
      const submitted = new Date(review.submittedAt);
      if (isNaN(submitted.getTime()) || submitted > to) return false;
    }

    return true;
  });

  // Pagination: offset & limit
  const offsetNum = offset ? parseInt(offset, 10) : 0;
  const limitNum = limit ? parseInt(limit, 10) : undefined;

  const paged =
    typeof limitNum === "number"
      ? filtered.slice(offsetNum, offsetNum + limitNum)
      : filtered.slice(offsetNum);

  return new HostawayResponseDto({
    result: paged,
    offset: offsetNum,
    count: filtered.length,
    status: HostawayResponseStatus.Success,
  });
}

/**
 * Patch review [status]
 * @param url request url
 * @param isAdmin does this req originate from an admin? NB: admin can fetch all reviews, others can only fetch public reviews

 */
function patchMockedReviewStatus(url: string, isAdmin: boolean) {
  if (!isAdmin) return; // shouldn't get here, router would have handled it

  const statusParam = new URL(url).searchParams.get("status");
  const reviewId = getUrlId(url, HOSTAWAY_REVIEWS_URL);

  if (!reviewId || !statusParam) {
    return new HostawayResponseDto({
      result: undefined,
      count: 0,
      offset: 0,
      status: HostawayResponseStatus.Failed,
    });
  }
  // Find and update review
  const reviewIndex = MOCKED_REVIEWS.findIndex((r) => r.id === reviewId);
  if (!reviewIndex || reviewIndex < 0) {
    return new HostawayResponseDto({
      result: undefined,
      count: 0,
      offset: 0,
      status: HostawayResponseStatus.Failed,
    });
  }

  MOCKED_REVIEWS[reviewIndex].status = statusParam;
  return new HostawayResponseDto({
    result: MOCKED_REVIEWS[reviewIndex],
    count: 1,
    offset: 0,
    status: HostawayResponseStatus.Success,
  });
}

// intercept hostaway requests
axios.interceptors.request.use(
  (config) => {
    if (!config.url) return config;

    const isAdmin =
      config.headers["Authorization"] === `Bearer ${API_ADMIN_TOKEN}`;

    const data = {
      status: "MOCK", // A custom identifier to recognize this is a mock
    };

    // handle listing mocking
    if (
      config.method === "get" &&
      (config.url === HOSTAWAY_LISTING_URL ||
        config.url === `${HOSTAWAY_LISTING_URL}/` ||
        config.url.startsWith(`${HOSTAWAY_LISTING_URL}?`) ||
        config.url.startsWith(`${HOSTAWAY_LISTING_URL}/?`))
    )
      return Promise.reject({ ...data, data: fetchMockedListings(config.url) });

    if (config.method === "get" && config.url.includes(HOSTAWAY_LISTING_URL))
      return Promise.reject({ ...data, data: fetchMockedListing(config.url) });

    // handle review patching

    if (
      config.method === "patch" &&
      (config.url.startsWith(`${HOSTAWAY_REVIEWS_URL}`) ||
        config.url.startsWith(`${HOSTAWAY_REVIEWS_URL}/`))
    )
      return Promise.reject({
        ...data,
        data: patchMockedReviewStatus(config.url, isAdmin),
      });

    // handle reviews mocking
    if (
      config.url === HOSTAWAY_REVIEWS_URL ||
      config.url === `${HOSTAWAY_REVIEWS_URL}/` ||
      config.url.startsWith(`${HOSTAWAY_REVIEWS_URL}?`) ||
      config.url.startsWith(`${HOSTAWAY_REVIEWS_URL}/?`)
    )
      return Promise.reject({
        ...data,
        data: fetchMockedReviews(config.url, isAdmin),
      });

    if (config.url.includes(HOSTAWAY_REVIEWS_URL))
      return Promise.reject({
        ...data,
        data: fetchMockedReview(config.url, isAdmin),
      });

    // Let other requests pass through
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR (Catches the rejected promise and converts it to a success)
axios.interceptors.response.use(
  (response) => {
    // If the request was successful, return the actual response
    return response;
  },
  (error) => {
    // Check if the error is the custom mock identifier
    if (error.status === "MOCK") {
      // Construct a proper axios response object
      const mockResponse = {
        data: error.data,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      };

      // Resolve the promise with a proper axios response structure
      return Promise.resolve(mockResponse);
    }

    // For real network errors, re-throw the error
    return Promise.reject(error);
  }
);
