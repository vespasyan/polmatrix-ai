import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import Navbar from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "PolMatrix",
  description: "Policy Simulation & AI Insight Tool",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="mid" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <Navbar />
          <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <main className="p-4">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
