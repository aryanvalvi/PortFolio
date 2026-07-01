const jwt = require("jsonwebtoken")
const prisma = require("../lib/prismaClient")

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ""

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token is missing." })
    }

    const token = header.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    })

    if (!user) {
      return res.status(401).json({ message: "User not found." })
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ message: "Invalid or expired token." })
  }
}

module.exports = requireAuth
