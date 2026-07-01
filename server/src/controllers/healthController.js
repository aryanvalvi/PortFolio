const prisma = require("../lib/prismaClient")

async function getHealth(_req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`
    const userCount = await prisma.user.count()
    res.json({ ok: true, message: "API is running.", dbConnected: true, adminReady: userCount > 0 })
  } catch (err) {
    res.status(503).json({ ok: false, message: "DB not connected.", dbConnected: false, error: err.message })
  }
}

module.exports = { getHealth }
