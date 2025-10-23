// app wide response dto

import { Expose } from "class-transformer";

export class ResponseDto {
  /**
   * response error code
   */
  @Expose()
  name!: string;

  /**
   * message that can be shown to users
   */
  @Expose()
  message!: string;

  /**
   * any other information
   */
  @Expose()
  data?: any;

  constructor(dto?: ResponseDto) {
    if (dto) Object.assign(this, dto);
  }
}
