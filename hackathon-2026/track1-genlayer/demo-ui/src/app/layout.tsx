import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trustless DeFi Commander",
  description: "Natural language DeFi commands on GenLayer + Base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[hsl(240,10%,3.9%)]">
        {children}
      </body>
    </html>
  );
}
