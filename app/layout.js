import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EmailAssist — Agentic AI Email Assistant",
  description: "Transform your inbox into structured, actionable workflows with AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* SessionProvider wraps the entire app for NextAuth client-side session access */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
