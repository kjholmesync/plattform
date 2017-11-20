const PgDb = require('./lib/pgdb')
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Engine } = require('apollo-engine')
const checkEnv = require('check-env')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

checkEnv([
  'DATABASE_URL',
  'SESSION_SECRET'
])

const {
  PORT,
  CORS_WHITELIST_URL,
  SESSION_SECRET,
  COOKIE_DOMAIN,
  ENGINE_API_KEY
} = process.env

// middlewares
const { express: { auth } } = require('backend-modules-auth')
const graphql = require('./express/graphql')

let pgdb
let server
let httpServer
let subscriptionServer

module.exports.run = (executableSchema, middlewares, t) => {
  // init apollo engine
  const engine = ENGINE_API_KEY
    ? new Engine({
      engineConfig: {
        apiKey: ENGINE_API_KEY,
        logging: {
          level: 'INFO'   // Engine Proxy logging level. DEBUG, INFO, WARN or ERROR
        }
      },
      graphqlPort: PORT
    })
    : null
  if (engine) {
    engine.start()
  }

  return PgDb.connect().then((_pgdb) => {
    pgdb = _pgdb
    server = express()
    httpServer = createServer(server)

    // apollo engine middleware
    if (engine) {
      server.use(engine.expressMiddleware())
    }

    // Once DB is available, setup sessions and routes for authentication
    auth.configure({
      server: server,
      secret: SESSION_SECRET,
      domain: COOKIE_DOMAIN || undefined,
      dev: DEV,
      pgdb: pgdb
    })

    if (CORS_WHITELIST_URL) {
      const corsOptions = {
        origin: CORS_WHITELIST_URL.split(','),
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
      }
      server.use('*', cors(corsOptions))
    }

    subscriptionServer = graphql(server, pgdb, httpServer, executableSchema, t)

    for(let middleware of middlewares) {
      middleware(server)
    }

    // start the server
    httpServer.listen(PORT, () => {
      console.info('server is running on http://localhost:' + PORT)
    })

    return { pgdb }
  })
}

module.exports.close = () => {
  const { pubsub } = require('./lib/RedisPubSub')
  pubsub.getSubscriber().quit()
  pubsub.getPublisher().quit()
  subscriptionServer.close()
  require('./lib/publicationScheduler').quit()
  httpServer.close()
  pgdb.close()
  require('./lib/redis').quit()
  pgdb = null
  server = null
  httpServer = null
  subscriptionServer = null
  // TODO server leaks timers, force teardown for now
  setTimeout(() => {
    process.exit(0)
  }, 30000)
}
