"use client"
import Container from "../components/container"
import Projects from "../components/Projects"
import { ContainerTextFlip } from "../components/ui/container-text-flip"
import Image from "next/image"
import { motion } from "motion/react"
import React from "react"

import Projects2 from "../components/Projects2"
const pill =
  "rounded-full border border-neutral-200 px-1.5 md:px-3 py-1 text-[0.60rem] md:text-[0.80rem] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
const whatIDo: { title: string; desc: React.ReactNode; tags: string[] }[] = [
  {
    title: "Frontend & UI/UX",
    desc: (
      <>
        I own the UI/UX of products from Figma to production, building with{" "}
        <strong>React</strong>, <strong>Next.js</strong> and{" "}
        <strong>TypeScript</strong>. I&apos;ve shipped the Electron desktop
        build of a 3D jewellery renderer, and moved my company&apos;s website
        from WordPress to a component-driven React codebase without changing
        how it looks.
      </>
    ),
    tags: [
      "React",
      "Next.js",
      "TypeScript",
      "Redux",
      "Tailwind CSS",
      "Electron.js",
      "Figma",
    ],
  },
  {
    title: "Backend & Databases",
    desc: (
      <>
        I design <strong>REST APIs</strong>, authentication and database schemas
        that hold up in production. That includes the backend for a custom
        jewellery e-commerce store with Razorpay payments, order management and
        an admin dashboard, and the API layer of a licensing platform serving
        100+ customers.
      </>
    ),
    tags: [
      "Node.js",
      "Express.js",
      "REST APIs",
      "JWT",
      "Prisma",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Socket.io",
      "Razorpay",
    ],
  },
  {
    title: "Licensing, Media & Security",
    desc: (
      <>
        I built the licensing system for my company&apos;s three products, with
        licences bound to a <strong>SHA-hashed machine code</strong> and
        protection against clock rollback, cloning and licence sharing. I also
        built a <strong>FFmpeg</strong> render pipeline that turns PNG frames
        into 4K/60fps video.
      </>
    ),
    tags: [
      "Software licensing",
      "Machine-code fingerprinting",
      "SHA hashing",
      "FFmpeg",
    ],
  },
  {
    title: "DevOps & Deployment",
    desc: (
      <>
        I set up and run the company&apos;s <strong>CI/CD</strong>, covering
        every deployment from dev to production. I&apos;m comfortable with{" "}
        <strong>Docker</strong>, Nginx and Linux on a <strong>VPS</strong>, with
        SSL/TLS in front.
      </>
    ),
    tags: ["Docker", "GitHub Actions", "Nginx", "VPS", "SSL/TLS", "Linux", "Bash"],
  },
]

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
        initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
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
          {/* <Projects2></Projects2> */}
          <div className="md:flex gap-30  flex-row py-10   p-6 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-center md:justify-start md:items-start">
              <h1 className="text-2xl whitespace-nowrap  md:text-4xl font-bold tracking-tight text-primary dark:text-primary-dark">
                What I do
              </h1>
            </div>
            <div className="flex gap-14 flex-col">
              {whatIDo.map(s => (
                <div key={s.title}>
                  <h2 className="text-md md:text-xl font-bold text-secondary dark:text-secondary-dark">
                    {s.title}
                  </h2>
                  <p className="text-sm text-secondary">{s.desc}</p>
                  <ul
                    className="mt-3 flex flex-wrap gap-2"
                    aria-label={`${s.title} skills`}
                  >
                    {s.tags.map(t => (
                      <li key={t} className={pill}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </motion.div>
    </div>
  )
}

export default page
