"use client"
import React, {useState} from "react"
import Container from "../container"
import Image from "next/image"
import Link from "next/link"
import {FiMoon, FiSun} from "react-icons/fi"
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  AnimatePresence,
} from "motion/react"
import {FiMenu, FiX} from "react-icons/fi"
import {useTheme} from "next-themes"
import {useEffect} from "react"
const Navbar = () => {
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
  const [hovered, setHovered] = useState<null | number>(null)
  const [scrolled, setScrolled] = useState<boolean>(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const {scrollY} = useScroll()
  const y = useTransform(scrollY, [0, 100], [0, 10])
  const width = useTransform(scrollY, [0, 100], ["800px", "700px"])
  useMotionValueEvent(scrollY, "change", latest => {
    if (latest > 20) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  })

  const [mounted, setMounted] = useState(false)
  const {theme, setTheme} = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Container className="relative">
      <motion.nav
        style={{
          boxShadow: scrolled ? "var(--shadow-aryan)" : "none",
          width: width,
          y,
          backgroundColor: scrolled
            ? "rgba(255, 255, 255, 0.4)"
            : "rgba(255, 255, 255, 0)",
        }}
        transition={{
          duration: 0.3,
          ease: "linear",
        }}
        className={`hidden md:flex fixed inset-x-0 top-0 z-50 max-w-full mx-auto items-center justify-between rounded-full px-4 py-2 ${
          scrolled ? "backdrop-blur-md dark:bg-neutral-900/80" : ""
        }`}
      >
        {/* <h1>ARYAN VALVI.</h1> */}
        <button
          className="absolute hidden md:block md:top-4.8 md:right-71 z-50 "
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
              <motion.div
                key="sun"
                initial={{opacity: 0, rotate: -90, scale: 0.5}}
                animate={{opacity: 1, rotate: 0, scale: 1}}
                exit={{opacity: 0, rotate: 90, scale: 0.5}}
                transition={{duration: 0.3}}
              >
                <FiSun size={15} className="text-black" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{opacity: 0, rotate: 90, scale: 0.5}}
                animate={{opacity: 1, rotate: 0, scale: 1}}
                exit={{opacity: 0, rotate: -90, scale: 0.5}}
                transition={{duration: 0.3}}
              >
                <FiMoon size={15} className="text-blue-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <Link href={"/"}>
          <Image
            className="relative h-10 w-10 object-cover rounded-full"
            src={theme === "dark" ? "/newport/logoa.png" : "/main.png"}
            // src={"/main.png"}
            height="100"
            width="100"
            alt="Avatar"
          ></Image>
        </Link>
        <div className="flex items-center hidden md:block">
          {navItems.map((item, idx) =>
            item.title === "Download Resume" ? (
              <a
                key={idx}
                href={item.href}
                download
                className="relative px-2 py-1 text-sm  dark:text-[#E5E5E5]"
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered === idx && (
                  <motion.span
                    layoutId="hovered-span"
                    className="absolute inset-0 h-full w-full rounded-md bg-neutral-100 dark:bg-neutral-800"
                  />
                )}

                <span className="relative z-10">{item.title}</span>
              </a>
            ) : (
              <Link
                key={idx}
                href={item.href}
                className="relative px-2 py-1 text-sm dark:text-white"
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered === idx && (
                  <motion.span
                    layoutId="hovered-span"
                    className="absolute inset-0 h-full w-full rounded-md bg-neutral-100 dark:bg-neutral-800"
                  />
                )}
                <span className="relative z-10">{item.title}</span>
              </Link>
            )
          )}
        </div>
      </motion.nav>
      <button
        className="absolute "
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === "light" ? (
            <motion.div
              key="sun"
              initial={{opacity: 0, rotate: -90, scale: 0.5}}
              animate={{opacity: 1, rotate: 0, scale: 1}}
              exit={{opacity: 0, rotate: 90, scale: 0.5}}
              transition={{duration: 0.3}}
            >
              <FiSun size={24} className="text-yellow-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{opacity: 0, rotate: 90, scale: 0.5}}
              animate={{opacity: 1, rotate: 0, scale: 1}}
              exit={{opacity: 0, rotate: -90, scale: 0.5}}
              transition={{duration: 0.3}}
            >
              <FiMoon size={24} className="text-blue-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* MOBILE NAVBAR (NEW) */}
      <div
        // ⬇️ Visible only on mobile (hidden on md+)
        className={`md:hidden fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 
 
        
        `}
      >
        {/* ${
          scrolled
            ? "backdrop-blur-md bg-white/90 dark:bg-neutral-900/80"
            : "bg-transparent"
        } */}
        {/* Logo on mobile */}
        <Link href={"/"}>
          <Image
            className="h-10 w-10 object-cover rounded-full"
            src={"/main.png"}
            height="80"
            width="80"
            alt="Avatar"
          />
        </Link>

        {/* ⬇️ Hamburger button toggles mobileOpen state */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-2xl absolute right-4 z-10 to-0%"
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN (NEW) */}
      {mobileOpen && (
        <div className="md:hidden min-h-[100vh] items-center justify-center fixed top-0 z-9  left-0 right-0 bg-white dark:bg-neutral-900 shadow-md flex flex-col items-center gap-4 py-4">
          {navItems.map((item, idx) =>
            item.title === "Download Resume" ? (
              <a
                key={idx}
                href={item.href}
                download
                className="text-sm  dark:text-white"
              >
                {item.title}
              </a>
            ) : (
              <Link
                key={idx}
                href={item.href}
                className="text-sm dark:text-white"
              >
                {item.title}
              </Link>
            )
          )}
          <button
            className="  md:hidden top-155 md:right-71 z-50 "
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "light" ? (
                <motion.div
                  key="sun"
                  initial={{opacity: 0, rotate: -90, scale: 0.5}}
                  animate={{opacity: 1, rotate: 0, scale: 1}}
                  exit={{opacity: 0, rotate: 90, scale: 0.5}}
                  transition={{duration: 0.3}}
                >
                  <FiSun size={18} className="text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{opacity: 0, rotate: 90, scale: 0.5}}
                  animate={{opacity: 1, rotate: 0, scale: 1}}
                  exit={{opacity: 0, rotate: -90, scale: 0.5}}
                  transition={{duration: 0.3}}
                >
                  <FiMoon size={18} className="text-blue-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}
    </Container>
  )
}

export default Navbar
