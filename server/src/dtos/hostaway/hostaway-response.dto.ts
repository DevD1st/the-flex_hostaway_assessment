import { Type } from "class-transformer";

export enum HostawayResponseStatus {
  Success = "success",
  Failed = "failed",
}

export class HostawayResponseDto {
  status!: HostawayResponseStatus;

  @Type(() => Number)
  count!: number;

  @Type(() => Number)
  offset?: number;

  result?: any;

  constructor(dto?: HostawayResponseDto) {
    if (dto) Object.assign(this, dto);
  }
}
