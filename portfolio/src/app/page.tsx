"use client"
import Container from "@/components/container"
import Projects from "@/components/Projects"
import {ContainerTextFlip} from "@/components/ui/container-text-flip"
import Image from "next/image"
import {motion} from "motion/react"
import React from "react"

import Projects2 from "@/components/Projects2"

const page = () => {
  const dev = [
    "Next.js",
    "TypeScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "SQL",
    "Postgres",
    "REST APIs",
    "Auth",
  ]
  const desing = ["Figma", "Tailwindcss", "Scss", "Wireframe"]
  const dep = ["VPS", "Nginx", "CI-CD", "Firewall", "SSL"]
  return (
    <div>
      <motion.div
        initial={{opacity: 0, filter: "blur(10px)", y: 10}}
        whileInView={{opacity: 1, filter: "blur(0px)", y: 0}}
        transition={{
          duration: 0.3,
          // delay: idx * 0.1,
          ease: "easeInOut",
        }}
        // key={idx}
        className="min-h-screen flex items-starts justify-center  "
      >
        <Container className=" min-h-[200vh] p-4 md:pt-30 md:pb-10 ">
          <div className="flex flex-col md:flex-row items-center borderr border-neutral-200  p-6 rounded-lg border-t-0 rounded-t-none">
            <div className="relative order-1 md:order-2 ">
              <Image
                className="object-cover w-30 h-30 md:w-[60rem] md:h-auto md:rounded-none relative  bg-blue-500 rounded-full md:[clip-path:polygon(50%_0%,100%_0,90%_77%,18%_100%,0%_38%)]"
                src="/AryanValvi.jpg"
                width={300}
                height={300}
                alt="avatar"
              ></Image>
            </div>
            <div className="order-2 md:order-1 items-center justify-center md:items-start md:justify-start">
              <span className="flex items-center justify-center flex-col md:items-start md:flex-none md:justify-start">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary dark:text-primary-dark">
                  Aryan valvi
                </h1>
                <ContainerTextFlip
                  className="mt-2"
                  words={["Software Engineer", "Full-Stack Engineer"]}
                ></ContainerTextFlip>
              </span>
              <p className="text-secondary dark:text-secondary-dark text-sm md:text-base pt-4">
                I’m a software engineer passionate about building scalable and
                efficient full stack systems.enjoy crafting both the front-end
                experiences that users love and the back-end systems that keep
                everything running smoothly
              </p>
            </div>
          </div>

          <Projects></Projects>
          <Projects2></Projects2>
          <div className="md:flex gap-30  flex-row py-10   p-6 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-center md:justify-start md:items-start">
              <h1 className="text-2xl whitespace-nowrap  md:text-4xl font-bold tracking-tight text-primary dark:text-primary-dark">
                What I do
              </h1>
            </div>
            <div className="flex  gap-14 flex-col ">
              <div>
                <h1 className="text-md md:text-xl font-bold text-secondary dark:text-secondary-dark">
                  design
                </h1>
                <p className="text-sm text-secondary">
                  I design beautiful and powerful websites for modern
                  businesses. Any business today needs a website that wins
                  customers’ trust and helps you do your business well. I make
                  sure your website is up to that standard.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {desing.map(t => (
                    <li
                      key={t}
                      className="rounded-full border border-neutral-200 px-1.5 md:px-3 py-1 text-[0.60rem] md:text-[0.80rem] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-md md:text-xl font-bold text-secondary dark:text-secondary-dark">
                  Development
                </h2>

                <p className="text-sm text-secondary">
                  I specialize in <strong>Next.js</strong>,{" "}
                  <strong>TypeScript</strong>, <strong>MERN</strong>,{" "}
                  <strong>SQL/Postgres</strong>, and I enjoy everything from
                  crafting smooth user interfaces to designing robust APIs and
                  databases
                </p>
                <ul
                  className="mt-3 flex flex-wrap gap-2"
                  aria-label="Tech stack"
                >
                  {dev.map(t => (
                    <li
                      key={t}
                      className="rounded-full border border-neutral-200 px-1.5 md:px-3 py-1 text-[0.60rem] md:text-[0.80rem] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-md md:text-xl font-bold text-secondary dark:text-secondary-dark">
                  Deployment
                </h2>
                <p className="text-sm text-secondary">
                  I have hands-on experience with{" "}
                  <strong>VPS deployment</strong>, ensuring applications are
                  securely hosted, optimized, and scalable in real-world
                  environments.
                </p>

                <ul
                  className="mt-3 flex flex-wrap gap-2"
                  aria-label="Tech stack"
                >
                  {dep.map(t => (
                    <li
                      key={t}
                      className="rounded-full border border-neutral-200 px-1.5 md:px-3 py-1 text-[0.60rem] md:text-[0.80rem] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </motion.div>
    </div>
  )
}

export default page
