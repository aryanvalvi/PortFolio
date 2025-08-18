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
  title: "Aryan Valvi",
  description:
    "Portfolio of Aryan Valvi - Next.js Developer, MERN Stack Developer, and Full Stack Engineer.",
  keywords: [
    "Aryan Valvi",
    "Full Stack Developer",
    "MERN Stack",
    "React.js",
    "Next.js",
    "Node.js",
    "Portfolio",
  ],
  authors: [{name: "Aryan Valvi", url: "https://aryanvalvi.com"}],
  creator: "Aryan Valvi",
  icons: {
    icon: "/mainicon.png",
    apple: "/mainicon.png",
  },
  openGraph: {
    type: "website",
    url: "https://aryanvalvi.com",
    title: "Aryan Valvi | Full Stack Developer",
    description:
      "Portfolio of Aryan Valvi - MERN Stack Developer, React.js Specialist, and Full Stack Engineer.",
    siteName: "Aryan Valvi",
    images: [
      {
        url: "https://aryanvalvi.com/aryan.jpeg",
        width: 1200,
        height: 630,
        alt: "Aryan Valvi Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aryan Valvi | Full Stack Developer",
    description:
      "Portfolio of Aryan Valvi - MERN Stack Developer, React.js Specialist, and Full Stack Engineer.",
    images: ["https://aryanvalvi.com/aryan.jpeg"],
    creator: "@Aryan___valvi",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/mainicon.png" />
      </head>
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
