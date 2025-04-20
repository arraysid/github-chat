"use client";

import { Button } from "@/components/ui/button";
import { useSigninGithub } from "../_hooks/use-signin-github";

export function SigninButton() {
  const { mutate, isPending } = useSigninGithub();

  return (
    <Button onClick={() => mutate()} disabled={isPending}>
      Signin
    </Button>
  );
}
