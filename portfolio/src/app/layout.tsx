import type {Metadata} from "next"
import {Inter} from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/Footer"
import Container from "@/components/container"
import {ThemeProvider} from "next-themes"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "AryanValvi",
  description: "bang portfolio by aryan",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-neutral-100 dark:bg-neutral-700`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar></Navbar>
          {children}
          <Container>
            <Footer></Footer>
          </Container>
        </ThemeProvider>
      </body>
    </html>
  )
}
