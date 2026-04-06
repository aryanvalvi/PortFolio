"use client"

import {motion} from "framer-motion"
import {CiLinkedin} from "react-icons/ci"
import {FaXTwitter} from "react-icons/fa6"
import {TfiEmail} from "react-icons/tfi"
import {LuGithub} from "react-icons/lu"
import Container from "../../components/container"
import emailjs from "@emailjs/browser"
import {useRef, useState} from "react"

export default function ContactPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [messageSend, setMessageSend] = useState<boolean>(false)
  const form = useRef<HTMLFormElement>(null)

  const sendEmail = (e: any) => {
    e.preventDefault()
    setLoading(true)

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        form.current!,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      .then(
        result => {
          console.log("Message sent:", result.text)
          setLoading(false)
          setMessageSend(true)
        },
        error => {
          console.log("Error:", error.text)
          setLoading(false)
        }
      )
  }

  return (
    <Container className="">
      <div className="max-w-3xl mx-auto px-6 py-26">
        <motion.h1
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
          className="text-3xl font-bold mb-4 text-primary"
        >
          <p className="text-2xl md:text-4xl font-bold tracking-tight text-primary dark:text-primary-dark">
            Let’s Connect
          </p>
        </motion.h1>

        <p className="text-secondary mb-10 text-sm md:text-base">
          I’d love to hear from you! Whether it’s a project idea, a
          collaboration, or just a friendly hello — feel free to reach out
          below.
        </p>

        {/* Contact Form */}
        <form className="space-y-4" ref={form} onSubmit={sendEmail}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="w-full  p-1 md:p-3 text-sm md:text-base rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            className="w-full p-1 md:p-3 text-sm md:text-base rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows={5}
            className="w-full p-1 md:p-3 text-sm md:text-base rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
            required
          />

          {!loading && !messageSend && (
            <button
              type="submit"
              className="px-3 py-1.5 md:px-6 md:py-3 text-sm md:text-base rounded-xl bg-neutral-800 text-white hover:scale-105 transition"
            >
              Send Message
            </button>
          )}

          {loading && (
            <motion.div
              className="w-10 h-10 border-4 border-gray-300 border-t-gray-600 rounded-full mx-auto"
              animate={{rotate: 360}}
              transition={{repeat: Infinity, duration: 1, ease: "linear"}}
            />
          )}

          {messageSend && (
            <motion.div
              className="flex justify-center items-center mx-auto"
              initial={{scale: 0}}
              animate={{scale: 1}}
              transition={{duration: 0.5}}
            >
              <svg
                className="w-12 h-12 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <motion.path
                  initial={{pathLength: 0}}
                  animate={{pathLength: 1}}
                  transition={{duration: 0.7, ease: "easeInOut"}}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          )}
        </form>

        <div className="flex gap-9 items-center mt-14">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-secondary">
            Socials
          </h1>
          <div className="flex gap-6 ">
            <a
              href="mailto:aryanvalvi323@gmail.com"
              target="_blank"
              rel="noreferrer"
            >
              <TfiEmail className=" hover:text-neutral-600 transition text-sm md:text-xl" />
            </a>
            <a
              href="https://www.linkedin.com/in/aryan-valvi-42822024b/"
              target="_blank"
              rel="noreferrer"
            >
              <CiLinkedin className=" hover:text-neutral-600 transition text-sm md:text-xl " />
            </a>
            <a
              href="https://github.com/aryanvalvi"
              target="_blank"
              rel="noreferrer"
            >
              <LuGithub className=" hover:text-neutral-600 transition text-sm md:text-xl" />
            </a>
            <a
              href="https://x.com/aryan___valvi"
              target="_blank"
              rel="noreferrer"
            >
              <FaXTwitter className=" hover:text-neutral-600 transition text-sm md:text-xl" />
            </a>
          </div>
        </div>
      </div>
    </Container>
  )
}
