import express from "express";
import { HOSTAWAY_LISTING_URL } from "../util/config";
import axios from "axios";
import { ResponseDto } from "../dtos/response/response.dto";
import {
  HostawayResponseDto,
  HostawayResponseStatus,
} from "../dtos/hostaway/hostaway-response.dto";
import { plainToInstance } from "class-transformer";
import { HostawayListingDto } from "../dtos/hostaway/hostaway-listing.dto";

const ListingsRouter = express.Router();

// GET /listings/:id - Get a single listing by ID
ListingsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (!id || isNaN(Number(id))) {
      return res.status(400).json(
        new ResponseDto({
          name: "ValidationError",
          message: "Please provide a valid listing ID",
        })
      );
    }

    // Call Hostaway API
    const response = await axios.get(`${HOSTAWAY_LISTING_URL}/${id}`);
    const hostawayResponse = plainToInstance(
      HostawayResponseDto,
      response.data as {}
    );

    // Check if response is successful and has data
    if (
      hostawayResponse.status !== HostawayResponseStatus.Success ||
      !hostawayResponse.result
    ) {
      return res.status(404).json(
        new ResponseDto({
          name: "NotFoundError",
          message: "Listing not found",
        })
      );
    }

    hostawayResponse.result = plainToInstance(
      HostawayListingDto,
      hostawayResponse.result
    );

    return res.json(
      new ResponseDto({
        name: "Success",
        message: "Listing retrieved successfully",
        data: hostawayResponse,
      })
    );
  } catch (error: any) {
    // Handle different types of errors
    if (error.response?.status === 404) {
      return res.status(404).json(
        new ResponseDto({
          name: "NotFoundError",
          message: "Listing not found",
        })
      );
    }

    return res.status(500).json(
      new ResponseDto({
        name: "InternalServerError",
        message: "Failed to fetch listing",
        data: { error: error.message },
      })
    );
  }
});

// GET /listings - Get all listings (ignore query params)
ListingsRouter.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${HOSTAWAY_LISTING_URL}`);

    const hostawayResponse = plainToInstance(
      HostawayResponseDto,
      response.data as {}
    );

    if (hostawayResponse.status !== HostawayResponseStatus.Success) {
      return res.status(400).json(
        new ResponseDto({
          name: "HostawayError",
          message: "Failed to fetch listings",
        })
      );
    }

    hostawayResponse.result = plainToInstance(
      HostawayListingDto,
      hostawayResponse.result
    );

    return res.json(
      new ResponseDto({
        name: "Success",
        message: "Listings retrieved successfully",
        data: hostawayResponse,
      })
    );
  } catch (error: any) {
    return res.status(500).json(
      new ResponseDto({
        name: "InternalServerError",
        message: "Failed to fetch listings",
        data: { error: error.message },
      })
    );
  }
});

export default ListingsRouter;
