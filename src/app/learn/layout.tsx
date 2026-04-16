import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const PAGE_TITLE =
  "LLM FinOps & GreenOps Guide: Token Pricing, Energy, Water & Carbon | LLM Juice Learning Hub";

const PAGE_DESCRIPTION =
  "Free guide to LLM FinOps (token pricing, unit economics), GreenOps (PUE, grid carbon, water footprint), green prompting, small models, and forecasting AI cost & sustainability—with curated sources.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  keywords: [
    "LLM FinOps",
    "AI GreenOps",
    "token pricing",
    "LLM sustainability",
    "data center water footprint",
    "PUE WUE",
    "green AI",
    "model routing",
    "LLM carbon footprint",
    "responsible AI",
  ],
  alternates: {
    canonical: "/learn",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/learn",
    type: "article",
    locale: "en_US",
    siteName: "LLM Juice",
  },
  twitter: {
    card: "summary",
    title: "LLM FinOps & GreenOps learning hub | LLM Juice",
    description: PAGE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

function learnJsonLd() {
  const base = getSiteUrl();
  const url = `${base}/learn`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${base}/#website`,
          name: "LLM Juice",
          url: base,
        },
        inLanguage: "en-US",
        about: [
          { "@type": "Thing", name: "FinOps" },
          { "@type": "Thing", name: "Sustainable computing" },
          { "@type": "Thing", name: "Large language models" },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: base },
          { "@type": "ListItem", position: 2, name: "Learning hub", item: url },
        ],
      },
    ],
  };
}

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = learnJsonLd();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
