require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")
const {ZodError} = require("zod")
const healthRoutes = require("./routes/health")
const authRoutes = require("./routes/auth")
const subjectRoutes = require("./routes/subjects")
const blogRoutes = require("./routes/blogs")
const uploadRoutes = require("./routes/uploads")
const {prisma} = require("./lib/prisma")

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in server/.env")
}

const app = express()
const port = Number(process.env.PORT || 4000)
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error("Origin is not allowed by CORS."))
    },
  })
)

app.use(express.json({limit: "10mb"}))
app.use(express.urlencoded({extended: true, limit: "10mb"}))
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

app.use("/api/health", healthRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/uploads", uploadRoutes)

app.use((error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation failed.",
      issues: error.flatten(),
    })
    return
  }

  if (error.message === "Origin is not allowed by CORS.") {
    response.status(403).json({message: error.message})
    return
  }

  const statusCode =
    typeof error.statusCode === "number" ? error.statusCode : 500

  if (statusCode >= 500) {
    console.error(error)
  }

  response.status(statusCode).json({
    message: error.message || "Something went wrong on the server.",
  })
})

async function getDatabaseStatus() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      connected: true,
      message: "Database connected successfully.",
    }
  } catch (error) {
    return {
      connected: false,
      message: `Database connection failed: ${error.message}`,
    }
  }
}

async function startServer() {
  const databaseStatus = await getDatabaseStatus()

  app.listen(port, () => {
    console.log(`Portfolio API running on http://localhost:${port}`)
    console.log(databaseStatus.message)
  })
}

startServer()

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}
