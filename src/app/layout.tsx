import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K Beauty Academy | Skincare & Makeup Courses",
  description: "Learn everything about Korean beauty. Complete your beauty routine with expert skincare and makeup courses.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
