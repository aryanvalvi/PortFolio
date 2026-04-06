const jwt = require("jsonwebtoken")
const {prisma} = require("../lib/prisma")

function getTokenFromRequest(request) {
  const authHeader = request.headers.authorization || ""

  if (!authHeader.startsWith("Bearer ")) {
    return null
  }

  return authHeader.slice(7)
}

async function requireAuth(request, response, next) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      response.status(401).json({message: "Authentication token is missing."})
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: {id: decoded.userId},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      response.status(401).json({message: "User not found."})
      return
    }

    request.user = user
    next()
  } catch (error) {
    response.status(401).json({message: "Invalid or expired token."})
  }
}

module.exports = {
  getTokenFromRequest,
  requireAuth,
}
