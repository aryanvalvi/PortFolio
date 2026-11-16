const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const prisma = require("../lib/prismaClient")

// ── POST /api/auth/login ──────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    const isBcrypt = /^\$2[aby]\$/.test(user.passwordHash)
    const matches = isBcrypt
      ? await bcrypt.compare(password, user.passwordHash)
      : password === user.passwordHash

    if (!matches) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    // Auto-upgrade legacy plain-text password to bcrypt hash
    if (!isBcrypt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(password, 10) }
      })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
function getCurrentUser(req, res) {
  res.json({ user: req.user })
}

module.exports = {
  login,
  getCurrentUser
}
