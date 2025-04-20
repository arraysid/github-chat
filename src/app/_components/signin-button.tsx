"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";

export function SigninButton() {
  const { mutate, isPending } = useSigninGithub();

  return (
    <Button onClick={() => mutate()} disabled={isPending}>
      Signin
    </Button>
  );
}

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
    onSuccess: (data) => {
      console.log(data);
    },
  });
}
