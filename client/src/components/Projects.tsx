"use client"
import Image from "next/image"
import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"

type Featured = {
  title: string
  tagline: string
  des: string
  highlights: string[]
  tech: string[]
  images: string[]
  href?: string
  cta?: string
  note?: string
  isBluestone?: boolean
}

type Mini = {
  title: string
  des: string
  images: string[]
  href?: string
  tech?: string[]
  isBluestone?: boolean
}

const featured: Featured[] = [
  {
    title: "ABC Jewels",
    tagline: "Full-stack e-commerce for the jewellery industry",
    des: "A custom-designed jewellery store built from scratch, from the React storefront to the API and database. It is a customisable base, so I can shape a new store around each client's needs.",
    highlights: [
      "Custom admin dashboard with inventory management",
      "Razorpay payments, order management and CRM",
      "Solo build, from schema design through deployment",
    ],
    tech: [
      "React",
      "TypeScript",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Prisma",
      "Redis",
      "Razorpay",
    ],
    images: ["/newport/Abc1.png", "/newport/Abc2.png", "/newport/Abc3.png"],
    href: "https://demo.tiaracommerce.com/",
    cta: "View live demo",
    isBluestone: true,
  },
  {
    title: "ELDS",
    tagline: "Electronic License Delivery System",
    des: "The licensing platform behind my company's three commercial products. I designed and built it solo, and it is live with 100+ customers.",
    highlights: [
      "Admin dashboard to issue, install, store, update and block licences",
      "Concurrent-session enforcement through web APIs",
      "On-premise LAN server that binds each licence to a SHA-hashed machine code, guarding against clock rollback, cloning and licence sharing",
    ],
    tech: ["React", "Node.js", "Express", "PostgreSQL", "Prisma", "SHA hashing"],
    images: ["/newport/elds1.png", "/newport/elds2.png", "/newport/elds3.png"],
    note: "In production. Private, so screenshots only.",
    isBluestone: true,
  },
  {
    title: "TiaraRender",
    tagline: "3D jewellery renderer, from web to desktop",
    des: "Renders 3DM and STL jewellery models with Three.js and exports them as images and video. I owned the full UI/UX and built the Electron desktop version.",
    highlights: [
      "Exports up to 4K and renders at 4K/60fps using FFmpeg",
      "Frames are rendered pixel by pixel, saved as PNG and encoded to video",
      "Backend auth integrated with the ELDS licensing system",
    ],
    tech: ["Three.js", "Electron.js", "FFmpeg", "Node.js"],
    images: ["/newport/tiararender-1.png", "/newport/3dVideo.webm"],
    href: "https://demo.tiararender.com",
    cta: "View live demo",
    isBluestone: true,
  },
]

const sites: Mini[] = [
  {
    title: "TiaraRender.com",
    des: "Product website for the TiaraRender jewellery renderer.",
    images: ["/newport/tiararenderWebsite.png", "/newport/tiararenderWebsite2.png"],
    href: "https://tiararender.com",
    isBluestone: true,
  },
  {
    title: "TiaraFab",
    des: "Product website for TiaraFab.",
    images: ["/newport/tiaraFab1.png", "/newport/tiaraFab2.png", "/newport/tiaraFab3.png"],
    isBluestone: true,
  },
  {
    title: "Urpti.com",
    des: "Product website for Urpti.",
    images: ["/newport/urptiWebsite1.png", "/newport/urptiWebsite2.png"],
    href: "https://urpti.in",
    isBluestone: true,
  },
]

const personal: Mini[] = [
  {
    title: "Uiuxyn",
    des: "A content-sharing platform where designers upload and showcase UI/UX designs, artwork and video, with multi-level access control. Hosted on a private VPS behind Nginx with HTTPS.",
    images: ["/newport/uiux.png"],
    tech: ["Next.js", "Express", "MongoDB", "TypeScript", "Cloudinary", "Nginx"],
  },
  {
    title: "Convexel",
    des: "Real-time chat with one-to-one and group conversations, online and typing indicators, and JWT auth over Socket.io. Fully Dockerised and deployed on a VPS with Nginx.",
    images: ["/newport/chat.png"],
    tech: ["Next.js", "Express", "PostgreSQL", "Prisma", "Socket.io", "Docker"],
  },
]

const pill =
  "rounded-full border border-neutral-200 px-2 md:px-3 py-1 text-[0.65rem] md:text-[0.75rem] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, filter: "blur(10px)", y: 10 },
  whileInView: { opacity: 1, filter: "blur(0px)", y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.3, delay, ease: "easeInOut" as const },
})

const AnimatedLiveDemoButton = ({ href }: { href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => e.stopPropagation()}
    className="relative inline-block py-1 text-sm whitespace-nowrap bg-gradient-to-r from-gray-800 via-white to-gray-900 bg-[length:200%_100%] bg-clip-text text-transparent animate-shine font-poppins font-bold"
  >
    Live demo
  </a>
)

const MediaItem = ({ src, alt, fill, sizes, className, onClick }: any) => {
  const isVideo = src.endsWith(".webm") || src.endsWith(".mp4")
  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        onClick={onClick}
        className={className}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : {}}
      />
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      onClick={onClick}
    />
  )
}

const Gallery = ({ images, title, setLightbox }: { images: string[]; title: string; setLightbox: (s: string) => void }) => {
  const [active, setActive] = useState(0)
  return (
    <div>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setLightbox(images[active]);
        }}
      >
        <MediaItem
          key={images[active]}
          src={images[active]}
          alt={`${title} screenshot ${active + 1}`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive(i);
              }}
              aria-label={`Show ${title} screenshot ${i + 1}`}
              className={`relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition ${i === active
                ? "border-neutral-900 dark:border-neutral-100"
                : "border-neutral-200 opacity-60 hover:opacity-100 dark:border-neutral-800"
                }`}
            >
              <MediaItem
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const FeaturedCard = ({ p, idx, setLightbox, setDisclaimerOpen, setProjectModal }: any) => (
  <motion.article
    {...fadeIn(0.05)}
    className={`group flex flex-col gap-6 md:items-center md:gap-10 ${idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
      } cursor-pointer p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors`}
    onClick={() => setProjectModal(p)}
  >
    <div className="w-full md:w-1/2">
      <Gallery images={p.images} title={p.title} setLightbox={setLightbox} />
    </div>

    <div className="w-full md:w-1/2">
      <p className="text-xs text-secondary dark:text-secondary-dark">
        {p.tagline}
      </p>
      <h3 className="mt-1 text-xl md:text-2xl font-bold tracking-tight text-primary dark:text-primary-dark">
        {p.title}
      </h3>

      <div className="mt-3 relative">
        <p className="text-sm text-secondary dark:text-secondary-dark line-clamp-3">
          {p.des}
        </p>
        {p.isBluestone && (
          <div className="text-right mt-0.5">
            <span
              onClick={(e) => { e.stopPropagation(); setDisclaimerOpen(true); }}
              className="text-neutral-400 dark:text-neutral-500 text-base font-bold cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300"
              title="Disclaimer"
            >
              *
            </span>
          </div>
        )}
      </div>

      <ul className="mt-3 space-y-1.5 hidden md:block">
        {p.highlights.map((h: string) => (
          <li
            key={h}
            className="flex gap-2 text-sm text-secondary dark:text-secondary-dark"
          >
            <span className="mt-[0.45rem] h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400" />
            {h}
          </li>
        ))}
      </ul>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
        {p.tech.map((t: string) => (
          <li key={t} className={pill}>
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex gap-5 items-center">
        {p.href ? (
          <AnimatedLiveDemoButton href={p.href} />
        ) : (
          <span className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-secondary dark:border-neutral-800 dark:text-secondary-dark">
            {p.note}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setProjectModal(p); }}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          View Details
        </button>
      </div>
    </div>
  </motion.article>
)

const MiniCard = ({ p, idx, setLightbox, setDisclaimerOpen, setProjectModal }: any) => {
  const img = (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setLightbox(p.images[0]);
      }}
    >
      <MediaItem
        src={p.images[0]}
        alt={p.title}
        fill
        sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-200 group-hover:scale-[1.02]"
      />
    </div>
  )
  return (
    <motion.div
      {...fadeIn(idx * 0.1)}
      className="group flex flex-col p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
      onClick={() => setProjectModal(p)}
    >
      {p.href ? (
        <a href={p.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          {img}
        </a>
      ) : (
        img
      )}
      <div className="mt-2 flex items-center justify-between">
        <h4 className="font-medium tracking-tight text-secondary dark:text-[#E5E5E5]">
          {p.title}
        </h4>
      </div>

      <div className="mt-1 relative">
        <p className="text-sm text-secondary dark:text-secondary-dark line-clamp-2">{p.des}</p>
        {p.isBluestone && (
          <div className="text-right mt-0.5">
            <span
              onClick={(e) => { e.stopPropagation(); setDisclaimerOpen(true); }}
              className="text-neutral-400 dark:text-neutral-500 text-base font-bold cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300"
              title="Disclaimer"
            >
              *
            </span>
          </div>
        )}
      </div>

      {p.tech && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {p.tech.map((t: string) => (
            <li key={t} className={pill}>
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 mt-auto pt-2">
        {p.href ? (
          <AnimatedLiveDemoButton href={p.href} />
        ) : (
          <span className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1.5 text-[0.65rem] md:text-xs text-secondary dark:border-neutral-800 dark:text-secondary-dark">
            {/* Screenshots only */}
          </span>
        )}
      </div>
    </motion.div>
  )
}

const Projects = () => {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [projectModal, setProjectModal] = useState<Featured | Mini | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="py-10 p-6 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] relative">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-primary dark:text-primary-dark">
        Selected work
      </h2>
      <p className="text-secondary dark:text-secondary-dark max-w-lg text-sm md:text-base pt-3">
        Production software I have built end-to-end, from UI and APIs to
        deployment.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {featured.map((p, i) => (
          <FeaturedCard key={p.title} p={p} idx={i} setLightbox={setLightbox} setDisclaimerOpen={setDisclaimerOpen} setProjectModal={setProjectModal} />
        ))}
      </div>

      <div className="mt-20">
        <h3 className="text-md md:text-xl font-bold text-secondary dark:text-secondary-dark px-4">
          Product sites
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 py-4">
          {sites.map((p, i) => (
            <MiniCard key={p.title} p={p} idx={i} setLightbox={setLightbox} setDisclaimerOpen={setDisclaimerOpen} setProjectModal={setProjectModal} />
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-md md:text-xl font-bold text-secondary dark:text-secondary-dark px-4">
          Personal projects
        </h3>
        <div className="grid sm:grid-cols-2 gap-2 py-4">
          {personal.map((p, i) => (
            <MiniCard key={p.title} p={p} idx={i} setLightbox={setLightbox} setDisclaimerOpen={setDisclaimerOpen} setProjectModal={setProjectModal} />
          ))}
        </div>
      </div>

      {mounted && createPortal(
        <>
          {/* Lightbox Modal */}
          <AnimatePresence>
            {lightbox && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10"
                onClick={() => setLightbox(null)}
              >
                <button
                  className="absolute top-4 right-4 md:top-8 md:right-8 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
                  onClick={() => setLightbox(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="relative w-full h-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                  <MediaItem
                    src={lightbox}
                    alt="Lightbox Media"
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer Modal */}
          <AnimatePresence>
            {disclaimerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setDisclaimerOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-neutral-200 dark:border-neutral-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    onClick={() => setDisclaimerOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-4 flex items-center gap-2">
                    <span className="text-neutral-400">*</span> Disclaimer
                  </h3>
                  <p className="text-secondary dark:text-secondary-dark leading-relaxed">
                    These projects are made under <strong>Bluestone Tech Labs</strong>.
                    As a developer, I do not have authority or ownership over this product.
                    They are displayed here solely to showcase my technical contributions and development skills.
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setDisclaimerOpen(false)}
                      className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
                    >
                      Understood
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project Details Modal */}
          <AnimatePresence>
            {projectModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10"
                onClick={() => setProjectModal(null)}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-neutral-200 dark:border-neutral-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 p-4 md:px-8 flex justify-between items-center">
                    <h3 className="text-xl md:text-2xl font-bold text-primary dark:text-primary-dark flex items-center gap-2">
                      {projectModal.title}
                    </h3>
                    <button
                      className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 p-2 rounded-full transition"
                      onClick={() => setProjectModal(null)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>

                  <div className="p-4 md:p-8">
                    {'highlights' in projectModal ? (
                      <div className="max-w-4xl mx-auto">
                        <Gallery images={projectModal.images} title={projectModal.title} setLightbox={setLightbox} />
                        <div className="mt-8 space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-primary dark:text-primary-dark">Overview</h4>
                            <div className="mt-2 relative">
                              <p className="text-secondary dark:text-secondary-dark leading-relaxed">
                                {projectModal.des}
                              </p>
                              {projectModal.isBluestone && (
                                <div className="text-right mt-1">
                                  <span
                                    onClick={(e) => { e.stopPropagation(); setDisclaimerOpen(true); }}
                                    className="text-neutral-400 dark:text-neutral-500 text-base font-bold cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300"
                                    title="Disclaimer"
                                  >
                                    *
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-lg font-bold text-primary dark:text-primary-dark mb-3">Key Highlights</h4>
                            <ul className="space-y-2">
                              {projectModal.highlights.map((h: string) => (
                                <li key={h} className="flex gap-3 text-secondary dark:text-secondary-dark">
                                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary dark:bg-primary-dark" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-lg font-bold text-primary dark:text-primary-dark mb-3">Technologies</h4>
                            <ul className="flex flex-wrap gap-2">
                              {projectModal.tech.map((t: string) => (
                                <li key={t} className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg text-sm">
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-4">
                            {projectModal.href && (
                              <AnimatedLiveDemoButton href={projectModal.href} />
                            )}
                            {!projectModal.href && (
                              <span className="inline-flex items-center rounded-xl border border-neutral-200 px-4 py-2 text-sm text-secondary dark:border-neutral-800 dark:text-secondary-dark">
                                {projectModal.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-4xl mx-auto">
                        <Gallery images={projectModal.images} title={projectModal.title} setLightbox={setLightbox} />

                        <div className="mt-8 space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-primary dark:text-primary-dark">Overview</h4>
                            <div className="mt-2 relative">
                              <p className="text-secondary dark:text-secondary-dark leading-relaxed">
                                {projectModal.des}
                              </p>
                              {projectModal.isBluestone && (
                                <div className="text-right mt-1">
                                  <span
                                    onClick={(e) => { e.stopPropagation(); setDisclaimerOpen(true); }}
                                    className="text-neutral-400 dark:text-neutral-500 text-xs cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300"
                                    title="Disclaimer"
                                  >
                                    *
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {projectModal.tech && (
                            <div>
                              <h4 className="text-lg font-bold text-primary dark:text-primary-dark mb-3">Technologies</h4>
                              <ul className="flex flex-wrap gap-2">
                                {projectModal.tech.map((t: string) => (
                                  <li key={t} className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg text-sm">
                                    {t}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                            {projectModal.href ? (
                              <AnimatedLiveDemoButton href={projectModal.href} />
                            ) : (
                              <span className="inline-flex items-center rounded-xl border border-neutral-200 px-4 py-2 text-sm text-secondary dark:border-neutral-800 dark:text-secondary-dark">
                                Screenshots only
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  )
}

export default Projects