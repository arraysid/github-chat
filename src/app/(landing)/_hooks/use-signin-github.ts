import { authClient } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";

export function useSigninGithub() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.social({
        provider: "github",
      });

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
