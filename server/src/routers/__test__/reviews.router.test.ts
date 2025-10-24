import request from "supertest";
import { server } from "../../server";

describe("Reviews Router Integration Tests", () => {
  let app: any;

  beforeEach(() => {
    app = server();
  });

  describe("GET /reviews/:id", () => {
    it("should return 400 for invalid review ID", async () => {
      const response = await request(app)
        .get("/reviews/invalid-id")
        .expect(400);

      expect(response.body).toEqual({
        name: "ValidationError",
        message: "Please provide a valid review ID",
      });
    });
  });

  describe("PATCH /reviews/:id", () => {
    it("should return 403 for unauthorized access", async () => {
      const response = await request(app).patch("/reviews/123").expect(403);

      expect(response.body).toEqual({
        name: "Forbidden",
        message: "Admin access required",
      });
    });

    it("should return 403 for invalid admin token", async () => {
      const response = await request(app)
        .patch("/reviews/123")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body).toEqual({
        name: "Forbidden",
        message: "Admin access required",
      });
    });

    it("should return 400 for invalid review ID", async () => {
      const response = await request(app)
        .patch("/reviews/invalid-id")
        .set("Authorization", "Bearer admin")
        .expect(400);

      expect(response.body).toEqual({
        name: "ValidationError",
        message: "Please provide a valid review ID",
      });
    });
  });
});
