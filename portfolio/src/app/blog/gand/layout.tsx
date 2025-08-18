import type {Metadata} from "next"
// import {Inter} from "next/font/google"
import "../../globals.css"

import Container from "@/components/container"

// const inter = Inter({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700", "800", "900"],
// })

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
    <Container className="prose min-h-screen p-4 md:pt-30 md:pb-10">
      {children}
    </Container>
  )
}
