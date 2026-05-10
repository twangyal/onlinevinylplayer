import "./globals.css";
import { AccountBar } from "@/src/app/AccountBar";
import { Sidebar } from "./Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen w-screen flex flex-col overflow-hidden bg-white">
        <main className="flex-1 overflow-hidden w-full">
        <div className="h-full flex w-full bg-white">
          <Sidebar/>
          {children}
        </div>
        </main>
      </body>
    </html>
  );
}