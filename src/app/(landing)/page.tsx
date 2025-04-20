import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { SigninButton } from "./_components/signin-button";

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="flex gap-x-4">
        <Link href="/dashboard" className={buttonVariants()}>
          Dashboard
        </Link>
        <SigninButton />
      </div>
    </main>
  );
}
