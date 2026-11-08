import { config } from './config/env.js'
import { prisma } from './config/database.js'
import app from './app.js'

const server = app.listen(config.port, () => {
  console.log(`Nexora API listening on http://localhost:${config.port}`)
})

async function shutdown(signal) {
  console.log(`${signal} received; closing server.`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
