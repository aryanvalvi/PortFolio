"use client"
import Container from "@/components/container"
import Image from "next/image"
import React from "react"
import {motion} from "motion/react"
import Link from "next/link"
const page = () => {
  const blogTopic = [
    {
      title: "Master JavaScript for Interviews",
      Img: "/blog/js.png",
      des: "A complete guide covering JavaScript from basics to advanced concepts, specially crafted to help you prepare for interviews with confidence.",
      link: "javascript",
    },
    {
      title: "Master React for Interviews",
      Img: "/blog/React.png",
      des: "Upcoming",
      link: "",
    },
  ]
  return (
    <Container className="min-h-screen">
      <motion.div
        initial={{opacity: 0, filter: "blur(10px)", y: 10}}
        whileInView={{opacity: 1, filter: "blur(0px)", y: 0}}
        transition={{
          duration: 0.3,
          // delay: idx * 0.1,
          ease: "easeInOut",
        }}
        // key={idx}
        className="md:pt-30 md:pb-10 p-4 "
      >
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary dark:text-primary-dark">
          All blogs
        </h1>
        <p className="text-secondary dark:text-secondary-dark text-sm md:text-base pt-4 w-xl">
          Explore insightful articles, guides, and resources designed to help
          you grow your knowledge and skills in web development
        </p>
        <div className="grid sm:grid-cols-2  gap-4 md:grid-cols-3 py-4">
          {blogTopic.map((item, idx) => {
            return (
              <Link href={`/blog/${item.link}`} key={idx} className="w-auto">
                <Image
                  className="w-full transition-transform duration-300 ease-in-out hover:scale-103 cursor-pointer"
                  src={item.Img}
                  height={300}
                  width={300}
                  alt="avatar"
                ></Image>
                <h2 className="text-primary dark:text-primary-dark text-md md:text-lg pt-4 w-xl">
                  {item.title}
                </h2>
                <p className="text-secondary dark:text-secondary-dark text-sm md:text-base pt-4">
                  {item.des}
                </p>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </Container>
  )
}

export default page
