import Link from "next/link"
import React from "react"
import {CiLinkedin} from "react-icons/ci"
import {CiInstagram} from "react-icons/ci"
import {FaXTwitter} from "react-icons/fa6"
import {TfiEmail} from "react-icons/tfi"

const Footer = () => {
  const navItems = [
    {
      title: "Download Resume",
      href: "/resume/AryanValvi-Resume-.pdf",
    },
    {
      title: "About",
      href: "/about",
    },
    // {
    //   title: "Projects",
    //   href: "/projects",
    // },
    {
      title: "Contact",
      href: "/contact",
    },
    // {
    //   title: "Blog",
    //   href: "/blog",
    // },
  ]
  return (
    <div className="bg-neutral-800 dark:bg-neutral-950 flex-col md:flex-row  md:gap-20 items-center md:items-start gap-5 flex justify-between p-4 relative">
      <h1 className="text-2xl   md:text-4xl font-bold tracking-tight text-white whitespace-nowrap">
        Want to work?
      </h1>

      <div className="">
        <h1 className="text-secondary dark:text-secondary-dark text-sm">
          I&apos;m currently looking for new opportunities. Whether you have a
          question or want to say hi, hit that button.{" "}
          <a href="mailto:aryanvalvi323@gmail.com">
            <span className="inline-block text-[0.50rem] md:text-sm p-1 bg-white dark:bg-neutral-400 text-secondary dark:text-white rounded-sm transform transition-transform duration-200 hover:scale-[1.08] cursor-pointer">
              Send Enquiry
            </span>
          </a>
        </h1>
        <div className="mt-5">
          <h1 className="text-base text-white font-extrabold">General</h1>
          <ul>
            {}
            {navItems.map((item, idx) =>
              item.title === "Download Resume" ? (
                <a href={item.href} download key={idx}>
                  <li className="text-sm text-white mt-2 cursor-pointer">
                    {item.title}
                  </li>
                </a>
              ) : (
                <Link href={item.href} key={idx}>
                  <li className="text-sm text-white mt-2 cursor-pointer">
                    {item.title}
                  </li>
                </Link>
              )
            )}
          </ul>
        </div>
        <div className="absolute right-0 bottom-0">
          <span className="flex gap-4 p-2">
            <TfiEmail className="fill-white text-xl cursor-pointer"></TfiEmail>
            <CiLinkedin className="fill-white text-xl cursor-pointer"></CiLinkedin>
            <CiInstagram className="fill-white text-xl cursor-pointer"></CiInstagram>
            <FaXTwitter className="fill-white text-xl cursor-pointer"></FaXTwitter>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Footer
