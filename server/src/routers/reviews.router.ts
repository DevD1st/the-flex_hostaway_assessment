import { plainToInstance } from "class-transformer";
import express from "express";
import { ReviewsQueryDto } from "../dtos/request/reviews-query.dto";
import { ResponseDto } from "../dtos/response/response.dto";
import axios from "axios";
import { API_ADMIN_TOKEN, HOSTAWAY_REVIEWS_URL } from "../util/config";
import {
  HostawayResponseDto,
  HostawayResponseStatus,
} from "../dtos/hostaway/hostaway-response.dto";
import { HostawayReviewDto } from "../dtos/hostaway/hostaway-review.dto";
import { validateDto } from "../util/func";

const ReviewsRouter = express.Router();

// GET /reviews - Get multiple reviews with optional filters
ReviewsRouter.get("/", async (req, res) => {
  try {
    // Create and validate the query DTO
    const queryDto = plainToInstance(ReviewsQueryDto, req.query);
    const errors = await validateDto(queryDto);

    if (errors) {
      return res.status(400).json(
        new ResponseDto({
          name: "ValidationError",
          message: errors.firstErrorMessage,
          data: errors.validationResult,
        })
      );
    }

    // Build query string from validated DTO
    const queryParams = new URLSearchParams();
    Object.entries(queryDto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.set(key, value.toString());
        }
      }
    });

    // Call Hostaway API
    const response = await axios.get(
      `${HOSTAWAY_REVIEWS_URL}?${queryParams.toString()}`,
      {
        headers: {
          Authorization: req.headers["authorization"],
        },
      }
    );
    const hostawayResponse = plainToInstance(
      HostawayResponseDto,
      response.data as {}
    );

    // Check if response is successful
    if (hostawayResponse.status !== HostawayResponseStatus.Success) {
      return res.status(400).json(
        new ResponseDto({
          name: "HostawayError",
          message: "Failed to fetch reviews",
        })
      );
    }

    hostawayResponse.result = plainToInstance(
      HostawayReviewDto,
      hostawayResponse.result
    );

    return res.json(
      new ResponseDto({
        name: "Success",
        message: "Reviews retrieved successfully",
        data: hostawayResponse,
      })
    );
  } catch (error: any) {
    return res.status(500).json(
      new ResponseDto({
        name: "InternalServerError",
        message: "Failed to fetch reviews",
        data: { error: error.message },
      })
    );
  }
});

export default ReviewsRouter;

// PATCH /reviews/:id - Admin only, update review status
import { PatchReviewStatusDto } from "../dtos/request/patch-review-status.dto";
import { HostawayReviewStatus } from "../dtos/hostaway/hostaway-review.dto";

ReviewsRouter.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const authHeader = req.headers["authorization"];
    // Only admin can patch
    if (authHeader !== `Bearer ${API_ADMIN_TOKEN}`) {
      return res.status(403).json(
        new ResponseDto({
          name: "Forbidden",
          message: "Admin access required",
        })
      );
    }
    // Validate id
    if (!id || isNaN(Number(id))) {
      return res.status(400).json(
        new ResponseDto({
          name: "ValidationError",
          message: "Please provide a valid review ID",
        })
      );
    }

    // Validate status
    const dto = plainToInstance(ReviewsQueryDto, req.query);
    const errors = await validateDto(dto);
    if (errors) {
      return res.status(400).json(
        new ResponseDto({
          name: "ValidationError",
          message: errors.firstErrorMessage,
          data: errors.validationResult,
        })
      );
    }

    // Call Hostaway mock PATCH
    const response = await axios.patch(
      `${HOSTAWAY_REVIEWS_URL}/${id}?status=${status}`,
      {},
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    const hostawayResponse = plainToInstance(
      HostawayResponseDto,
      response.data as {}
    );
    if (hostawayResponse.status !== HostawayResponseStatus.Success) {
      return res.status(404).json(
        new ResponseDto({
          name: "NotFoundError",
          message: "Review not found or could not update",
        })
      );
    }
    hostawayResponse.result = plainToInstance(
      HostawayReviewDto,
      hostawayResponse.result
    );
    return res.json(
      new ResponseDto({
        name: "Success",
        message: "Review status updated successfully",
        data: hostawayResponse,
      })
    );
  } catch (error: any) {
    return res.status(500).json(
      new ResponseDto({
        name: "InternalServerError",
        message: "Failed to update review status",
        data: { error: error.message },
      })
    );
  }
});

// GET /reviews/:id - Get a single review by ID
ReviewsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json(
        new ResponseDto({
          name: "ValidationError",
          message: "Please provide a valid review ID",
        })
      );
    }

    const response = await axios.get(`${HOSTAWAY_REVIEWS_URL}/${id}`, {
      headers: {
        Authorization: req.headers["authorization"],
      },
    });
    const hostawayResponse = plainToInstance(
      HostawayResponseDto,
      response.data as {}
    );

    if (hostawayResponse.status !== HostawayResponseStatus.Success) {
      return res.status(404).json(
        new ResponseDto({
          name: "NotFoundError",
          message: "Review not found",
        })
      );
    }

    hostawayResponse.result = plainToInstance(
      HostawayReviewDto,
      hostawayResponse.result
    );

    return res.json(
      new ResponseDto({
        name: "Success",
        message: "Review retrieved successfully",
        data: hostawayResponse,
      })
    );
  } catch (error: any) {
    if (error.response?.status === 404) {
      return res.status(404).json(
        new ResponseDto({
          name: "NotFoundError",
          message: "Review not found",
        })
      );
    }

    return res.status(500).json(
      new ResponseDto({
        name: "InternalServerError",
        message: "Failed to fetch review",
        data: { error: error.message },
      })
    );
  }
});
