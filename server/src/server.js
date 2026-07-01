require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")
const routes = require("./routes/index")
const prisma = require("./lib/prismaClient")

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in server/.env")
}

const app = express()
const port = Number(process.env.PORT || 4000)

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      callback(new Error("Origin is not allowed by CORS."))
    },
  })
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

app.use("/api", routes)

// ── Global error handler ──────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  if (err.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ message: err.message })
  }

  const status = typeof err.statusCode === "number" ? err.statusCode : 500
  if (status >= 500) console.error(err)

  res.status(status).json({ message: err.message || "Something went wrong." })
})

// ── Start ─────────────────────────────────────────────────────────────────────

async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log("Database connected.")
  } catch {
    console.warn("Database not connected — check DATABASE_URL.")
  }

  app.listen(port, () => {
    console.log(`Portfolio API running on http://localhost:${port}`)
  })
}

start()

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}
