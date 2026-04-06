const {prisma} = require("../lib/prisma")

async function getHealth(_request, response, next) {
  try {
    await prisma.$queryRaw`SELECT 1`
    const userCount = await prisma.user.count()

    response.json({
      ok: true,
      message: "Portfolio API is running.",
      dbConnected: true,
      adminReady: userCount > 0,
    })
  } catch (error) {
    response.status(503).json({
      ok: false,
      message: "Portfolio API is running, but the database is not connected.",
      dbConnected: false,
      error: error.message,
    })
  }
}

module.exports = {
  getHealth,
}
