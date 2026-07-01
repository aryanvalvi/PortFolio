const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const prisma = require("../lib/prismaClient")

async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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

    // upgrade plain-text password to bcrypt on first login
    if (!isBcrypt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(password, 10) },
      })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

function getCurrentUser(req, res) {
  res.json({ user: req.user })
}

async function createAdmin(req, res, next) {
  try {
    const { email, password, name } = req.body

    const passwordHash = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: { name, passwordHash },
      create: { email: email.toLowerCase(), name, passwordHash },
    })

    res.status(201).json({
      message: "Admin created successfully.",
      user: { id: admin.id, name: admin.name, email: admin.email },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { login, getCurrentUser, createAdmin }
