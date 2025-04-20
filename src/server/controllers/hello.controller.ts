import { createEndpoint } from "better-call";
import { authMiddleware } from "../middlewares";

export const hello = createEndpoint(
  "/api/hello",
  {
    method: "GET",
    use: [authMiddleware],
  },
  async () => {
    return {
      message: "Hello from backend!",
    };
  },
);
