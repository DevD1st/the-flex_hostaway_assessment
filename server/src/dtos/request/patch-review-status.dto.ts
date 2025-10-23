import { IsEnum } from "class-validator";
import { HostawayReviewStatus } from "../hostaway/hostaway-review.dto";

export class PatchReviewStatusDto {
  @IsEnum(HostawayReviewStatus, {
    message: "Please provide a valid review status.",
  })
  status!: HostawayReviewStatus;
}
