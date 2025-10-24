import {
  validateDto,
  transformStringToStringArray,
  transformStringToIntArray,
} from "../func";
import { TransformFnParams } from "class-transformer";

// Mock class-validator
jest.mock("class-validator", () => ({
  validate: jest.fn(),
}));

import { validate } from "class-validator";

describe("func.ts", () => {
  describe("validateDto", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return undefined when validation passes", async () => {
      // Arrange
      (validate as jest.Mock).mockResolvedValue([]);
      const mockDto = { name: "test" };

      // Act
      const result = await validateDto(mockDto);

      // Assert
      expect(result).toBeUndefined();
      expect(validate).toHaveBeenCalledWith(mockDto);
    });

    it("should return validation error when validation fails", async () => {
      // Arrange
      const mockValidationResult = [
        {
          constraints: {
            isNotEmpty: "Name should not be empty",
            isString: "Name must be a string",
          },
        },
      ];
      (validate as jest.Mock).mockResolvedValue(mockValidationResult);
      const mockDto = { name: "" };

      // Act
      const result = await validateDto(mockDto);

      // Assert
      expect(result).toEqual({
        firstErrorMessage: "Name should not be empty",
        validationResult: mockValidationResult,
      });
    });

    it("should return default error message when constraints are empty", async () => {
      // Arrange
      const mockValidationResult = [{}];
      (validate as jest.Mock).mockResolvedValue(mockValidationResult);
      const mockDto = { name: "" };

      // Act
      const result = await validateDto(mockDto);

      // Assert
      expect(result).toEqual({
        firstErrorMessage: "Validation error.",
        validationResult: mockValidationResult,
      });
    });
  });

  describe("transformStringToStringArray", () => {
    it("should return undefined for null value", () => {
      // Arrange
      const param: TransformFnParams = {
        value: null,
        key: "test",
        obj: {},
        type: 0, // TransformationType.PLAIN_TO_CLASS
        options: {},
      };

      // Act
      const result = transformStringToStringArray(param);

      // Assert
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      // Arrange
      const param: TransformFnParams = {
        value: "",
        key: "test",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToStringArray(param);

      // Assert
      expect(result).toBeUndefined();
    });

    it("should return array for single string value", () => {
      // Arrange
      const param: TransformFnParams = {
        value: "single",
        key: "test",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToStringArray(param);

      // Assert
      expect(result).toEqual(["single"]);
      expect(param.obj["test"]).toEqual(["single"]);
      expect(param.value).toEqual(["single"]);
    });

    it("should split comma-separated string into array", () => {
      // Arrange
      const param: TransformFnParams = {
        value: "apple, banana, cherry",
        key: "fruits",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToStringArray(param);

      // Assert
      expect(result).toEqual(["apple", "banana", "cherry"]);
      expect(param.obj["fruits"]).toEqual(["apple", "banana", "cherry"]);
      expect(param.value).toEqual(["apple", "banana", "cherry"]);
    });

    it("should handle already array values", () => {
      // Arrange
      const param: TransformFnParams = {
        value: ["already", "array"],
        key: "test",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToStringArray(param);

      // Assert
      expect(result).toEqual(["already", "array"]);
      expect(param.obj["test"]).toEqual(["already", "array"]);
      expect(param.value).toEqual(["already", "array"]);
    });
  });

  describe("transformStringToIntArray", () => {
    it("should return undefined for null value", () => {
      // Arrange
      const param: TransformFnParams = {
        value: null,
        key: "test",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToIntArray(param);

      // Assert
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      // Arrange
      const param: TransformFnParams = {
        value: "",
        key: "test",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToIntArray(param);

      // Assert
      expect(result).toBeUndefined();
    });

    it("should convert single string number to array", () => {
      // Arrange
      const param: TransformFnParams = {
        value: "42",
        key: "numbers",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToIntArray(param);

      // Assert
      expect(result).toEqual([42]);
      expect(param.obj["numbers"]).toEqual([42]);
      expect(param.value).toEqual([42]);
    });

    it("should split comma-separated string and convert to integers", () => {
      // Arrange
      const param: TransformFnParams = {
        value: "1, 2, 3, 4",
        key: "numbers",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToIntArray(param);

      // Assert
      expect(result).toEqual([1, 2, 3, 4]);
      expect(param.obj["numbers"]).toEqual([1, 2, 3, 4]);
      expect(param.value).toEqual([1, 2, 3, 4]);
    });

    it("should handle already array values and convert to integers", () => {
      // Arrange
      const param: TransformFnParams = {
        value: ["5", "6", "7"],
        key: "numbers",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToIntArray(param);

      // Assert
      expect(result).toEqual([5, 6, 7]);
      expect(param.obj["numbers"]).toEqual([5, 6, 7]);
      expect(param.value).toEqual([5, 6, 7]);
    });

    it("should handle NaN values gracefully", () => {
      // Arrange
      const param: TransformFnParams = {
        value: "1, abc, 3",
        key: "numbers",
        obj: {},
        type: 0,
        options: {},
      };

      // Act
      const result = transformStringToIntArray(param);

      // Assert
      expect(result).toEqual([1, NaN, 3]);
      expect(param.obj["numbers"]).toEqual([1, NaN, 3]);
      expect(param.value).toEqual([1, NaN, 3]);
    });
  });
});
