import "./globals.css";
import { AccountBar } from "@/src/app/AccountBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* AccountBar stays at the top of every page */}
        <AccountBar />
        
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}