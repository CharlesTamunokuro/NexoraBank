import 'dotenv/config'

const required = ['DATABASE_URL', 'JWT_SECRET', 'CLIENT_URL']
const missing = required.filter((name) => !process.env[name])

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters.')
}

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  port: Number(process.env.PORT || process.env.SERVER_PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
}

















// import 'dotenv/config'

// const required = ['DATABASE_URL', 'JWT_SECRET', 'CLIENT_URL']
// const missing = required.filter((name) => !process.env[name])

// if (missing.length) {
//   throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
// }

// if (process.env.JWT_SECRET.length < 32) {
//   throw new Error('JWT_SECRET must be at least 32 characters.')
// }

// export const config = {
//   databaseUrl: process.env.DATABASE_URL,
//   jwtSecret: process.env.JWT_SECRET,
//   clientUrl: process.env.CLIENT_URL,
//   port: Number(process.env.SERVER_PORT || 5000),
//   nodeEnv: process.env.NODE_ENV || 'development',
// }
