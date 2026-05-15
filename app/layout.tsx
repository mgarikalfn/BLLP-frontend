import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "BLLP",
  description: "Bilingual language learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const data = localStorage.getItem('theme-storage');
            if (data && JSON.parse(data).state.isDark) {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {}
        ` }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
