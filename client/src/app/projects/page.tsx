"use client"
import React from "react"
import {motion} from "motion/react"
import Image from "next/image"
import Container from "../../components/container"
const Page = () => {
  const projects = [
    {
      heading: "Uiuxyn",
      stack: ["Next.js", "TypeScript", "Node.js", "Express", "MongoDB"],
      des: "UIxyn is my personal design and development showcase where I experiment with UI concepts, share unique projects, and highlight modern web experiences. It’s a blend of creativity and engineering—where clean design meets scalable code.",
      img: "/port/uiuxyn.png",
      live: "https:uiuxyn.xyz",
    },
    {
      heading: "Team website",
      stack: ["Figma", "Webflow"],
      des: "A full website design and build for a concept team collaboration platform. This website also includes a beautiful blog. I have built the website and the blog in Webflow which has one of the best CMS for blog hosting.",
      img: "/port/teamPort.png",
      live: "https://team-app-81af94.webflow.io/",
    },
  ]

  return (
    <motion.div
      initial={{opacity: 0, filter: "blur(10px)", y: 10}}
      whileInView={{opacity: 1, filter: "blur(0px)", y: 0}}
      transition={{
        duration: 0.3,

        ease: "easeInOut",
      }}
      className="min-h-screen flex items-starts justify-center "
    >
      <Container className="min-h-[200vh] p-4 md:pt-30 md:pb-10">
        {projects.map((item, idx) => {
          return (
            <div
              className="flex items-center justify-center w-full gap-2 mt-4"
              key={idx}
            >
              <div className="mt-3 max-w-[30rem]">
                <p className="text-secondary text-sm tracking-widest uppercase md:text-[0.70rem] pt-4">
                  latest work
                </p>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary mt-4">
                  {item.heading}
                </h1>
                <span className="flex items-center mt-2 gap-2 ">
                  <p className="text-sm font-bold text-secondary">
                    Tech Stack :{" "}
                  </p>
                  <ul className=" flex flex-wrap gap-2">
                    {item.stack.map(t => (
                      <li
                        key={t}
                        className="rounded-full border border-neutral-200 px-1.5 py-1 text-[0.70rem] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </span>
                <p className="text-sm text-secondary mt-1">{item.des}</p>
                <div className="">
                  <a
                    href={item.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-block px-1 py-3  text-sm whitespace-nowrap 
                 bg-gradient-to-r from-gray-800 via-white to-gray-900 bg-[length:200%_100%] 
                 bg-clip-text text-transparent animate-shine font-poppins font-bold"
                  >
                    Live demo
                  </a>
                </div>
              </div>

              <div>
                <a href={item.live} target="_blank" rel="noopener noreferrer">
                  <Image
                    className=" w-[40rem] h-auto shadow-aryann transition-transform duration-300 ease-in-out hover:scale-105"
                    src={item.img}
                    height="500"
                    width="500"
                    alt="avatar"
                  ></Image>
                </a>
              </div>
            </div>
          )
        })}
      </Container>
    </motion.div>
  )
}

export default Page
