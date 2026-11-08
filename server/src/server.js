import { config } from './config/env.js'
import { prisma } from './config/database.js'
import app from './app.js'


// const PORT = process.env.PORT || config.port || 5000;

// const server = app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Nexora API listening on port ${PORT}`);
// });

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
