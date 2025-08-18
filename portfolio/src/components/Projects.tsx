"use client"
import Image from "next/image"
import React from "react"
import {motion} from "motion/react"

const Projects = () => {
  const projects = [
    {
      title: "Uiuxyn",
      src: "/newport/uiux.png",
      href: "https://uiuxyn.xyz",
      des: "UIUXYN is a creative platform designed to express and share innovative ideas with the world",
    },
    {
      title: "Landing Page",
      src: "/newport/team.png",
      href: "https://team-app-81af94.webflow.io/",
      des: "Modern basic Landing page for testing webflow and figma designs",
    },
    {
      title: "Upcoming Project",
      src: "/newport/chat.png",
      href: "https://uiuxyn.xyz",
      des: "Development stage  Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
    },
  ]
  return (
    <div className="py-10   p-6 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] ">
      <p className="text-secondary dark:text-secondary-dark max-w-lg text-sm md:text-base pt-4">
        I love building web apps and product.
      </p>
      <div className="grid sm:grid-cols-2  gap-4 md:grid-cols-3 py-4">
        {projects.map((item, idx) => (
          <motion.div
            initial={{opacity: 0, filter: "blur(10px)", y: 10}}
            whileInView={{opacity: 1, filter: "blur(0px)", y: 0}}
            transition={{
              duration: 0.3,
              delay: idx * 0.1,
              ease: "easeInOut",
            }}
            key={idx}
            className="group relative flex flex-col mb-8"
          >
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              <Image
                className="w-full object-cover rounded-xl transition duration-200 group-hover:scale-[1.02]"
                src={item.src}
                alt={item.title}
                height={300}
                width={300}
              ></Image>
            </a>
            <h2 className="mt-2 font-medium tracking-tight text-secondary dark:text-[#E5E5E5] ">
              {item.title}
            </h2>
            <p className="text-sm text-secondary dark:text-secondary-dark ">
              {item.des}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Projects
