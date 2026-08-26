import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tixora Admin",
  description: "Admin dashboard for managing Tixora events, categories, and orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <div
          aria-hidden
          style={{ display: "none" }}
          dangerouslySetInnerHTML={{
            __html: `<!--
IMPECCABLE DIRECTION CONTRACT [seed: canon-classic-admin-linear]
THESIS: An admin never has to think about the interface, only the task in front of them.
OWN-WORLD: Classic SaaS admin convention (Linear-grade craft) -- white surface, near-black
text, one restrained blue (primary/ring/active-nav) for actions and current state, a faint
cool-blue tint distinguishing the sidebar from content. One sans family throughout, fixed
rem type scale, standard shadcn/ui components at default radius.
STORY: Admin logs in, lands on an overview, manages events/categories with full CRUD,
reviews read-only orders. Nothing here persuades; it just gets out of the way.
FIRST VIEWPORT: centered white login card on a soft blue-tinted ground; dashboard opens to
a light sidebar (blue active-item) + header, content area in white on faint gray.
FORM: category-standard canon, user-selected over the dealt/pick directions; craft bar
confirmed as Linear.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
the verdict, DESIGN.md, and every shipping raster carrying its provenance.
-->`,
          }}
        />
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
