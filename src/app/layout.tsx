import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TokenomicsProvider } from "./TokenomicsContext";
import Link from "next/link";
import { BrandTitle } from "@/components/BrandTitle";
import { getSiteUrl } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"] });

const defaultDescription =
  "Estimate LLM token cost, electricity, CO₂e, and water for one completion. Live OpenRouter pricing, typical vs longer replies, benchmarks, and exportable share cards.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: "/image.png",
    shortcut: "/image.png",
    apple: "/image.png",
  },
  title: {
    default: "LLM Juice | AI FinOps & GreenOps Calculator",
    template: "%s | LLM Juice",
  },
  description: defaultDescription,
  keywords: [
    "LLM cost calculator",
    "OpenRouter pricing",
    "AI FinOps",
    "LLM carbon footprint",
    "LLM Juice",
    "GreenOps",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LLM Juice",
    title: "LLM Juice | AI FinOps & GreenOps Calculator",
    description: defaultDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "LLM Juice | AI FinOps & GreenOps",
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground dark:bg-zinc-950 dark:text-zinc-50">
        <TokenomicsProvider>
          <TooltipProvider>
            
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container px-4 md:px-8 mx-auto flex h-16 items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center rounded-md pr-1 outline-offset-4 transition-opacity hover:opacity-90"
                  aria-label="LLM Juice — home"
                >
                  <BrandTitle />
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium">
                  <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">Calculator</Link>
                  <Link href="/learn" className="transition-colors hover:text-foreground/80 text-foreground/60">Learning Hub</Link>
                </nav>
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-8 mx-auto">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built by{" "}
                  <a
                    href="https://www.linkedin.com/in/marco-donatucci-9517462bb/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    Marco Donatucci
                  </a>
                  <span className="text-muted-foreground"> — Cloud &amp; AI</span>.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.linkedin.com/in/marco-donatucci-9517462bb/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </footer>

          </TooltipProvider>
        </TokenomicsProvider>
      </body>
    </html>
  );
}
