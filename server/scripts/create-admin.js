require("dotenv").config()

const bcrypt = require("bcryptjs")
const {prisma} = require("../src/lib/prisma")

function readArg(name) {
  const flag = process.argv.find(argument => argument.startsWith(`--${name}=`))

  if (!flag) {
    return undefined
  }

  return flag.slice(name.length + 3)
}

async function main() {
  const email = (readArg("email") || process.env.ADMIN_EMAIL || "").toLowerCase()
  const password = readArg("password") || process.env.ADMIN_PASSWORD || ""
  const name = readArg("name") || process.env.ADMIN_NAME || "Portfolio Admin"

  if (!email || !password) {
    console.error(
      "Usage: npm run create-admin -- --email=you@example.com --password=secret123 --name='Your Name'"
    )
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const admin = await prisma.user.upsert({
    where: {email},
    update: {
      name,
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
    },
  })

  console.log(`Admin ready for login: ${admin.email}`)
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
