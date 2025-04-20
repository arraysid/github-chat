import { Providers } from "@/components/providers";
import "@/styles/fonts.css";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Github Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
