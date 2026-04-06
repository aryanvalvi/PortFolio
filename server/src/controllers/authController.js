const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {z} = require("zod")
const {prisma} = require("../lib/prisma")

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function isBcryptHash(value) {
  return /^\$2[aby]\$/.test(value)
}

async function login(request, response, next) {
  try {
    const payload = loginSchema.parse(request.body)
    const user = await prisma.user.findUnique({
      where: {email: payload.email.toLowerCase()},
    })

    if (!user) {
      response.status(401).json({message: "Invalid email or password."})
      return
    }

    const passwordMatches = isBcryptHash(user.passwordHash)
      ? await bcrypt.compare(payload.password, user.passwordHash)
      : payload.password === user.passwordHash

    if (!passwordMatches) {
      response.status(401).json({message: "Invalid email or password."})
      return
    }

    if (!isBcryptHash(user.passwordHash)) {
      const nextHash = await bcrypt.hash(payload.password, 10)

      await prisma.user.update({
        where: {id: user.id},
        data: {passwordHash: nextHash},
      })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRES_IN || "7d"}
    )

    response.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

function getCurrentUser(request, response) {
  response.json({user: request.user})
}

module.exports = {
  login,
  getCurrentUser,
}
