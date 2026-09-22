import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Workspace Explorer",
  description: "A browser-based file manager for folders and text files.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
