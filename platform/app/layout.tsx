import type { ReactNode } from "react";

export const metadata = {
  title: "Tafheem Platform",
  description: "Tafheem Phase 1 MVP backend (test shell — no design)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
