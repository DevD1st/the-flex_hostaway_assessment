import { validate } from "class-validator";

export async function validateDto(dto: object) {
  const validationResult = await validate(dto);

  let firstErrorMessage = "Validation error.";
  if (validationResult.length && validationResult[0].constraints)
    firstErrorMessage = Object.entries(validationResult[0].constraints)[0][1];

  if (validationResult.length) return { firstErrorMessage, validationResult };
}
