"use client"
import Container from "../../components/container"

import Image from "next/image"
import React from "react"
import { motion } from "motion/react"

const facts = [
  {
    label: "Now",
    value: "Full Stack Developer at BlueStone Tech Labs, Mumbai",
  },
  {
    label: "Education",
    value: "B.E. Computer Engineering, Atharva College of Engineering (2025)",
  },
  { label: "CGPA", value: "8.4 / 10" },
]

const Page = () => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
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
              className="w-64 sm:w-80 lg:w-[22rem] h-auto rounded-lg object-contain"
              src="/aryan2.PNG"
              width={300}
              height={300}
              alt="avatar"
            />
          </div>

          <div id="about" className="flex-1" aria-labelledby="about-heading">
            <div className="max-w-none space-y-4 text-sm md:text-base leading-7 text-primary dark:text-secondary-dark">
              <p>
                Hi, I&apos;m <span className="font-semibold">Aryan Valvi</span>,
                a <span className="font-medium">Full Stack Developer</span> who
                ships production software end to end, from the UI and REST APIs
                to deployment. I graduated in Computer Engineering in 2025 and
                now work at{" "}
                <span className="font-medium">BlueStone Tech Labs</span> in
                Mumbai.
              </p>

              <p>
                My main stack is <strong>React</strong>, <strong>Next.js</strong>
                , <strong>TypeScript</strong>, <strong>Node.js</strong> and{" "}
                <strong>PostgreSQL</strong>, with Prisma, Redis and Docker
                around it. At work I&apos;m the sole developer of{" "}
                <strong>ELDS</strong>, the licensing platform behind the
                company&apos;s three commercial products, which is live with
                100+ customers. I also built the UI/UX and Electron desktop app
                for <strong>TiaraRender</strong>, a 3D jewellery renderer that
                exports 4K video with FFmpeg, and a custom e-commerce store for
                a jewellery client, from schema design to deployment.
              </p>

              <p>
                I like owning the whole stack. I set up the company&apos;s CI/CD
                with GitHub Actions, Docker, Nginx and Linux, and I care as much
                about how a product is deployed and protected as how it looks.
              </p>

              <p>
                Outside the editor, I&apos;m a big fan of{" "}
                <strong>cricket</strong> 🏏, I love <strong>anime</strong> and{" "}
                <strong>web series</strong> 🎬, and I stay consistent with my{" "}
                <strong>workouts</strong> 💪. I aim to build products that
                don&apos;t just work, they <em>wow</em>.
              </p>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              {facts.map(f => (
                <div
                  key={f.label}
                  className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
                >
                  <dt className="text-xs text-secondary dark:text-secondary-dark">
                    {f.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-primary dark:text-primary-dark">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <p className="text-secondary text-sm md:text-base pt-4"></p>
      </Container>
    </motion.div>
  )
}

export default Page