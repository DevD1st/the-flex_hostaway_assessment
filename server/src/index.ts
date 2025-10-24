import "reflect-metadata"; // needed for validation and transformer
import "./util/setup-hostaway-mock"; // setup mock
import express, { NextFunction, Request, Response } from "express";
import ListingsRouter from "./routers/listings.router";
import ReviewsRouter from "./routers/reviews.router";
import { ResponseDto } from "./dtos/response/response.dto";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.urlencoded());

app.use("/listings", ListingsRouter);
app.use("/reviews", ReviewsRouter);

// not found route
app.use((_, res) => {
  res.status(404).json(
    new ResponseDto({
      name: "NOT_FOUND",
      message: "Not found.",
    })
  );
});

// error boundary
app.use((error: Error, _: Request, res: Response, _1: NextFunction) => {
  console.error(error);

  let name = "Unknown";
  let message = "Error occurred, please try again later.";
  let data = undefined;

  if (error instanceof ResponseDto) {
    return res.status(400).json(error);
  }

  res.status(500).json(
    new ResponseDto({
      name,
      message,
      data,
    })
  );
});

app.listen(3000, () => {
  console.log("Listenning on port 3000");
});
