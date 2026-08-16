import type { Metadata } from "next";
import "./globals.css";
import { TrpcProvider } from "@/providers/TrpcProvider";

export const metadata: Metadata = {
  title: "MavunoOne - Business Management System",
  description: "Complete business management system for Tanzania - Sales, Stock, Machines, Vehicles, and Customer Credit",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MavunoOne",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
