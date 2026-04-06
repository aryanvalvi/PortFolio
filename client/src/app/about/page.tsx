"use client"
import Container from "../../components/container"

import Image from "next/image"
import React from "react"
import {motion} from "motion/react"

const Page = () => {
  return (
    <motion.div
      initial={{opacity: 0, filter: "blur(10px)", y: 10}}
      whileInView={{opacity: 1, filter: "blur(0px)", y: 0}}
      transition={{
        duration: 0.3,
        // delay: idx * 0.1,
        ease: "easeInOut",
      }}
      className="min-h-screen "
    >
      <Container className="min-h-screen p-4 md:pt-30 md:pb-10">
        <h1 className="mt-20 md:mt-0 text-2xl md:text-4xl font-bold tracking-tight text-primary dark:text-primary-dark mb-5">
          About me
        </h1>
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-20">
          <div className="flex justify-center lg:justify-start lg:flex-shrink-0">
            <Image
              className="w-64 sm:w-80 lg:w-[22rem] h-auto rounded-lg"
              src="/aryan.jpeg"
              width={300}
              height={300}
              alt="avatar"
            />
          </div>

          <div id="about" className="flex-1" aria-labelledby="about-heading">
            <div className="max-w-none space-y-4 text-sm md:text-base leading-7 text-primary dark:text-secondary-dark">
              <p>
                Hi, I&apos;m <span className="font-semibold">Aryan Valvi</span>{" "}
                — a{" "}
                <span className="font-medium">
                  Computer Engineer (Class of 2025, CGPA 8.17)
                </span>{" "}
                and a <span className="font-medium">Full Stack Developer</span>{" "}
                who loves building scalable, modern, and user-friendly
                applications.
              </p>

              <p>
                I specialize in <strong>Next.js</strong>,{" "}
                <strong>TypeScript</strong>, <strong>MERN</strong>,{" "}
                <strong>SQL/Postgres</strong>, and I enjoy everything from
                crafting smooth user interfaces to designing robust APIs and
                databases. My projects span web dev, AI/ML, and IoT — like a
                stock market prediction platform with TradingView, a
                Dribbble-style design showcase, and an IoT-based health
                monitoring system.
              </p>

              <p>
                Outside the editor, I&apos;m a big fan of{" "}
                <strong>cricket</strong> 🏏, I love <strong>anime</strong> and{" "}
                <strong>web series</strong> 🎬, and I stay consistent with my{" "}
                <strong>workouts</strong> 💪. I aim to build products that
                don&apos;t just work — they <em>wow</em>.
              </p>
            </div>
          </div>
        </div>
        <p className="text-secondary text-sm md:text-base pt-4"></p>
      </Container>
    </motion.div>
  )
}

export default Page
