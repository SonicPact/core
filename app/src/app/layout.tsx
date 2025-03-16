import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";
import Providers from "./providers";
import ConnectButton from "@/shared/components/ConnectButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SonicPact",
  description:
    "Decentralized deal-making platform for gaming studios and celebrities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <nav className="fixed bg-background/70 z-50 backdrop-blur-lg py-3 px-6 w-full flex items-center">
            <Link href="/" className="flex text-3xl items-center gap-x-2">
              <img
                src="/logo.png"
                alt="logo"
                className="size-[1.5em] object-contain"
              />
              <h1 className="font-bold uppercase tracking-[-0.1em]">
                Sonic
                <span className="bg-gradient-to-br from-primary to-secondary text-transparent bg-clip-text">
                  _Pact
                </span>
              </h1>
            </Link>

            <div className="flex-1 flex justify-center">
              <div className="flex gap-x-6">
                <Link
                  href="/explore"
                  className="hover:text-primary transition-colors"
                >
                  Explore
                </Link>
                <Link
                  href="/dashboard"
                  className="hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/deals/create"
                  className="hover:text-primary transition-colors"
                >
                  Create Deal
                </Link>
              </div>
            </div>

            <div>
              <ConnectButton />
            </div>
          </nav>
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
