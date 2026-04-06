"use client"
import React from "react"
import {motion} from "motion/react"
import Image from "next/image"
import Container from "./container"

const Projects2 = () => {
  const projects = [
    {
      heading: "Uiuxyn",
      stack: ["Next.js", "TypeScript", "Node.js", "Express", "MongoDB"],
      des: "Uiuxyn is my personal design and development showcase where I experiment with UI concepts, share unique projects, and highlight modern web experiences. It’s a blend of creativity and engineering—where clean design meets scalable code.",
      img: "/newport/uiux.png",
      live: "https://uiuxyn.xyz",
    },
    {
      heading: "Team website",
      stack: ["Figma", "Webflow"],
      des: "A full website design and build for a concept team collaboration platform. This website also includes a beautiful blog. I have built the website and the blog in Webflow which has one of the best CMS for blog hosting.",
      img: "/newport/team.png",
      live: "https://team-app-81af94.webflow.io/",
    },
  ]
  return (
    <motion.div
      initial={{opacity: 0, filter: "blur(10px)", y: 10}}
      whileInView={{opacity: 1, filter: "blur(0px)", y: 0}}
      transition={{
        duration: 0.3,
        // delay: idx * 0.1,
        ease: "easeInOut",
      }}
      className=" flex items-starts justify-center  py-10   p-6 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] "
    >
      <Container className=" p-4 md:pt-3 md:pb-10">
        {/* <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary">
          Projects
        </h1> */}

        {projects.map((item, idx) => {
          return (
            <div
              className="flex items-center justify-center w-full gap-5 mt-4 md:mt-7 flex-col md:flex-row"
              key={idx}
            >
              <div className="-mt-5 max-w-[30rem] order-2 md:order-1 ">
                <p className="text-secondary text-sm tracking-widest uppercase md:text-[0.70rem] pt-4">
                  latest work
                </p>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary dark:text-primary-dark mt-4">
                  {item.heading}
                </h1>
                <span className="flex   mt-2 gap-2 ">
                  <p className="text-sm mt-1 font-bold text-secondary whitespace-nowrap">
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

              <div className="order-1 md:order-2">
                <a href={item.live} target="_blank" rel="noopener noreferrer">
                  <Image
                    className=" w-[30rem]  md:w-[80rem] h-auto shadow-aryann transition-transform duration-300 ease-in-out hover:scale-105"
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

        {/* <p className="text-secondary text-sm md:text-base pt-4"></p> */}
        {/* <DraggableCardDemo></DraggableCardDemo> */}
      </Container>
    </motion.div>
  )
}

export default Projects2
