import type { Metadata } from "next";

import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bastami Management System",
  description: "Bastami Frozen Foood",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Toaster position="top-right" richColors closeButton theme="light" />
        {children}
      </body>
    </html>
  );
}
