import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Link href="/dashboard" className={buttonVariants()}>
        Dashboard
      </Link>
    </main>
  );
}
