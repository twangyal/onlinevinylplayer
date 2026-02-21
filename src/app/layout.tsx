import "./globals.css";
import { AccountBar } from "@/src/app/AccountBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}