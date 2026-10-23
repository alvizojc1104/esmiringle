import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "esmiringle — live text chat",
  description: "Anonymous 1-on-1 live text chatting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
