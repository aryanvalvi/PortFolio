import React from "react"
import Container from "../container"
import Navbar from "../navbar/Navbar"
import Footer from "../Footer"

const BlogLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
      <Container>
        <div className="prose pt-50 p-4">{children}</div>
      </Container>
    </div>
  )
}

export default BlogLayout
