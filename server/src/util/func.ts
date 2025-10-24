import { TransformFnParams } from "class-transformer";
import { validate } from "class-validator";

export async function validateDto(dto: object) {
  const validationResult = await validate(dto);

  let firstErrorMessage = "Validation error.";
  if (validationResult.length && validationResult[0].constraints)
    firstErrorMessage = Object.entries(validationResult[0].constraints)[0][1];

  if (validationResult.length) return { firstErrorMessage, validationResult };
}

export function transformStringToStringArray(param: TransformFnParams) {
  const value = param.value;

  if (value == null || value === "") return undefined;

  // accept comma separated values or array
  const transformedStrings = Array.isArray(value)
    ? value
    : typeof value === "string" && value.includes(",")
    ? value.split(",").map((v) => v.trim())
    : [value];

  param.obj[param.key] = transformedStrings;
  param.value = transformedStrings;
  return transformedStrings;
}

export function transformStringToIntArray(param: TransformFnParams) {
  const value = param.value;

  if (value == null || value === "") return undefined;

  // accept comma separated values or array
  let transformedStrings = Array.isArray(value)
    ? value
    : typeof value === "string" && value.includes(",")
    ? value.split(",").map((v) => v.trim())
    : [value];

  transformedStrings = transformedStrings.map((v) => parseInt(v));

  param.obj[param.key] = transformedStrings;
  param.value = transformedStrings;
  return transformedStrings;
}
