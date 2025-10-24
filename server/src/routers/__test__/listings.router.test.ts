import request from "supertest";
import { server } from "../../server";

describe("Listings Router Integration Tests", () => {
  let app: any;

  beforeEach(() => {
    app = server();
  });

  describe("GET /listings/:id", () => {
    it("should return 400 for invalid listing ID", async () => {
      const response = await request(app)
        .get("/listings/invalid-id")
        .expect(400);

      expect(response.body).toEqual({
        name: "ValidationError",
        message: "Please provide a valid listing ID",
      });
    });

    it("should return 200 for empty listing ID (hits GET /listings route)", async () => {
      const response = await request(app).get("/listings/").expect(200);

      expect(response.body.name).toBe("Success");
    });

    it("should return 404 for invalid ID", async () => {
      const response = await request(app).get("/listings/123").expect(404);

      expect(response.body.name).toBe("NotFoundError");
      expect(response.body.message).toBe("Listing not found");
    });
  });
});
