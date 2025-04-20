import { createEndpoint } from "better-call";

export const hello = createEndpoint(
  "/api/hello",
  {
    method: "GET",
  },
  async () => {
    return {
      message: "Hello from backend!",
    };
  },
);
